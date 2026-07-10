# GrowEasy CSV Importer — Backend

## Setup

1. Terminal mein is folder ke andar aa jao:
   ```
   cd groweasy-csv-importer-backend
   ```

2. Dependencies install karo:
   ```
   npm install
   ```

3. `.env.example` file ka naam copy karke `.env` banao, aur usme apni Gemini API key daalo:
   ```
   cp .env.example .env
   ```

4. Server chalu karo:
   ```
   npm run dev
   ```

5. Browser ya Postman mein check karo:
   ```
   http://localhost:8000/api/health
   ```
   Isse `{ "status": "ok", ... }` response milna chahiye.
