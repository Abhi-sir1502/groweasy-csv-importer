import { Router } from "express";
import { extractBatch } from "../services/llmService.js";
import { rowsToObjects, chunkArray } from "../utils/csvUtils.js";
import { sanitizeCrmRecord, hasContactInfo } from "../utils/validators.js";

const router = Router();

const BATCH_SIZE = 20; // ek baar mein kitni rows Gemini ko bhejni hain
const MAX_RETRIES = 2; // ek batch fail ho to kitni baar dobara try karein

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractBatchWithRetry(batch) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await extractBatch(batch);
    } catch (err) {
      lastError = err;
      console.error(`Batch extraction attempt ${attempt} failed:`, err.message);

      // Rate limit (429) hone par turant retry karne se koi fayda nahi —
      // thoda wait karke retry karte hain taaki quota reset ho sake
      if (err.status === 429 && attempt < MAX_RETRIES) {
        const waitMs = 10000 * attempt; // 10s, fir 20s...
        console.log(`Rate limit hit, ${waitMs / 1000}s wait karke retry karenge...`);
        await sleep(waitMs);
      }
    }
  }
  throw lastError;
}

router.post("/extract", async (req, res) => {
  try {
    const { headers, rows } = req.body;

    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      return res.status(400).json({ error: "headers aur rows arrays hone chahiye." });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: "CSV mein koi data row nahi mili." });
    }

    const records = rowsToObjects(headers, rows);
    const batches = chunkArray(records, BATCH_SIZE);

    const allExtracted = [];
    const allSkipped = []; // { row: {...}, reason: "..." }
    let offset = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      try {
        const result = await extractBatchWithRetry(batch);

        (result.records || []).forEach((record) => {
          const cleanRecord = sanitizeCrmRecord(record);
          // Safety net: agar AI ne bhool se bina email/mobile wala record bhi
          // "records" mein daal diya ho, to use yahan skip kar dete hain
          if (hasContactInfo(cleanRecord)) {
            allExtracted.push(cleanRecord);
          } else {
            allSkipped.push({
              row_number: null,
              original_data: cleanRecord,
              reason: "Email aur mobile number dono nahi mile (backend safety check)",
            });
          }
        });

        // skipped indexes batch ke andar relative hote hain, unhe overall CSV index mein convert karte hain
        (result.skipped || []).forEach((relativeIndex) => {
          const globalIndex = relativeIndex + offset;
          allSkipped.push({
            row_number: globalIndex + 1,
            original_data: records[globalIndex],
            reason: "Email aur mobile number dono nahi mile",
          });
        });
      } catch (err) {
        // Poora batch fail ho gaya (retries ke baad bhi) — us batch ki saari rows ko skipped maano
        for (let i = 0; i < batch.length; i++) {
          const globalIndex = i + offset;
          allSkipped.push({
            row_number: globalIndex + 1,
            original_data: records[globalIndex],
            reason: "AI extraction fail hui (server/network error)",
          });
        }
      }
      offset += batch.length;

      // Batches ke beech chhota sa gap — rate limit se bachne ke liye (bade CSVs ke liye zaroori)
      if (batchIndex < batches.length - 1) {
        await sleep(800);
      }
    }

    res.json({
      total_rows: records.length,
      total_imported: allExtracted.length,
      total_skipped: allSkipped.length,
      records: allExtracted,
      skipped: allSkipped,
    });
  } catch (err) {
    console.error("Extraction error:", err);
    res.status(500).json({ error: "AI extraction mein kuch galat ho gaya." });
  }
});

// Real-time progress ke liye — Server-Sent Events use karke har batch complete hone par
// frontend ko turant update bhejta hai (batch number, total batches, running counts)
router.post("/extract-stream", async (req, res) => {
  const { headers, rows } = req.body;

  if (!Array.isArray(headers) || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "headers aur rows valid arrays hone chahiye." });
  }

  // SSE headers set karte hain — ye batata hai browser ko ki ye ek streaming response hai
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  function sendEvent(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const records = rowsToObjects(headers, rows);
  const batches = chunkArray(records, BATCH_SIZE);

  sendEvent("start", { totalBatches: batches.length, totalRows: records.length });

  const allExtracted = [];
  const allSkipped = [];
  let offset = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const result = await extractBatchWithRetry(batch);

      (result.records || []).forEach((record) => {
        const cleanRecord = sanitizeCrmRecord(record);
        if (hasContactInfo(cleanRecord)) {
          allExtracted.push(cleanRecord);
        } else {
          allSkipped.push({
            row_number: null,
            original_data: cleanRecord,
            reason: "Email aur mobile number dono nahi mile (backend safety check)",
          });
        }
      });

      (result.skipped || []).forEach((relativeIndex) => {
        const globalIndex = relativeIndex + offset;
        allSkipped.push({
          row_number: globalIndex + 1,
          original_data: records[globalIndex],
          reason: "Email aur mobile number dono nahi mile",
        });
      });
    } catch (err) {
      for (let j = 0; j < batch.length; j++) {
        const globalIndex = j + offset;
        allSkipped.push({
          row_number: globalIndex + 1,
          original_data: records[globalIndex],
          reason: "AI extraction fail hui (server/network error)",
        });
      }
    }

    offset += batch.length;

    // Is batch ke complete hone ka event bhejte hain — frontend progress bar update karega
    sendEvent("progress", {
      batchNumber: i + 1,
      totalBatches: batches.length,
      importedSoFar: allExtracted.length,
      skippedSoFar: allSkipped.length,
    });

    // Batches ke beech chhota sa gap — rate limit se bachne ke liye (bade CSVs ke liye zaroori)
    if (i < batches.length - 1) {
      await sleep(800);
    }
  }

  // Final result ek "complete" event ke roop mein bhejte hain
  sendEvent("complete", {
    total_rows: records.length,
    total_imported: allExtracted.length,
    total_skipped: allSkipped.length,
    records: allExtracted,
    skipped: allSkipped,
  });

  res.end();
});

export default router;
