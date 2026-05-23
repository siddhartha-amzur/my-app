# Playwright E2E Test Plan

## Covered flows
- login flow
- SQL query flow
- SQL validation blocking
- Excel upload flow
- CSV upload flow
- Google Sheet flow
- thread persistence
- refresh persistence
- memory follow-up questions
- mobile responsiveness
- frontend error detection

## Run steps
1. Start backend: `d:/Forge/.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
2. Start frontend: `npm run dev -- --host 0.0.0.0 --port 5173`
3. Install Playwright deps: `npm install` then `npx playwright install`
4. Set credentials env vars:
   - `E2E_EMAIL`
   - `E2E_PASSWORD`
5. Run tests:
   - `npm run test:e2e`
   - `npm run test:e2e:mobile`

## Monitoring workflow while running tests
- Keep backend terminal visible for timing logs:
  - upload duration
  - SQL execution duration
  - dataframe processing duration
  - gsheet fetch duration
- Watch browser console and Playwright HTML report for UI errors.
- If test fails, fix code and rerun the failing spec first, then full suite.
