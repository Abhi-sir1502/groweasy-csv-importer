// Rows (array of arrays) + headers ko objects mein convert karte hain
// e.g. headers=["name","email"], row=["John","john@x.com"] -> {name:"John", email:"john@x.com"}
export function rowsToObjects(headers, rows) {
  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj;
  });
}

// Ek badi array ko chhote-chhote batches (chunks) mein todta hai
export function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
