const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const ALLOWED_CRM_STATUS = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

const ALLOWED_DATA_SOURCE = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

// Groq ko diya jaane wala instruction — CRM field rules yahan define hain
function buildPrompt(records) {
  return `You are a data-extraction engine for a CRM lead importer. You will receive raw CSV rows (as JSON objects) that may have inconsistent, messy, or unexpected column names. Map each row into the exact CRM schema below.

CRM FIELDS TO OUTPUT (use these exact keys):
created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

RULES:
1. crm_status must be exactly one of: ${ALLOWED_CRM_STATUS.join(", ")}. If unclear, leave it blank ("").
2. data_source must be exactly one of: ${ALLOWED_DATA_SOURCE.join(", ")}. If none match confidently, leave it blank ("").
3. created_at must be a valid date string parseable by JavaScript's Date() constructor (e.g. "2026-05-13 14:20:48").
4. crm_note should contain: remarks, follow-up notes, extra comments, extra phone numbers, extra email addresses, or any useful info that doesn't fit another field.
5. If multiple emails exist in a row, use the first as "email" and append the rest into crm_note. Same rule for multiple mobile numbers.
6. A row must be SKIPPED only if it has NEITHER an email NOR a mobile number. If it has at least ONE of the two (even if the other is missing/blank), it MUST be included in "records" — do not skip it.
   Example: a row with a mobile number but a blank/missing email → INCLUDE it (email field = "").
   Example: a row with an email but a blank/missing mobile number → INCLUDE it (mobile field = "").
   Example: a row with both email and mobile blank/missing → SKIP it.
   Add the original row index (0-based, relative to the input array below) to the "skipped" array ONLY for rows you skip under this rule.
7. Keep every value as a single line — no raw line breaks inside any field. Escape them as \\n if needed.
8. If a field cannot be confidently determined, leave it as an empty string "" — never invent data.

INPUT ROWS (JSON array, each object is one CSV row using its original column names):
${JSON.stringify(records, null, 2)}

RESPOND WITH ONLY VALID JSON, no markdown, no code fences, no explanation. Exact shape:
{
  "records": [ { "created_at": "", "name": "", "email": "", "country_code": "", "mobile_without_country_code": "", "company": "", "city": "", "state": "", "country": "", "lead_owner": "", "crm_status": "", "crm_note": "", "data_source": "", "possession_time": "", "description": "" } ],
  "skipped": [ 0, 3 ]
}`;
}

// Ek batch (records ka chota group) ko Groq ko bhejta hai aur parsed JSON wapas deta hai
export async function extractBatch(records) {
  const prompt = buildPrompt(records);

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const error = new Error(`Groq API error (${response.status}): ${errText}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? "";
  const cleanText = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    throw new Error("Groq se invalid JSON response mila: " + rawText.slice(0, 200));
  }
}
