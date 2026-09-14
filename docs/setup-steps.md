# Setup Steps — Environment Loop

## Before (WS-01 through WS-04)

เพื่อนใหม่ที่ clone repo นี้ ก่อนมี Docker ต้องทำตามลำดับนี้กว่าจะรัน app + test ได้ครบ:

1. ติดตั้ง Python 3.12 และ Node 24
2. `cd backend && pip install -r requirements-dev.txt`
3. `cd frontend && npm ci`
4. `cd .. && npm ci` (ติดตั้ง Playwright ที่ root)
5. `npx playwright install --with-deps chromium`
6. คัดลอก `.env.example` เป็น `.env` แล้วเติมค่า (`DATABASE_URL`, `SECRET_KEY`, `VITE_API_BASE_URL`)
7. เปิด terminal ที่ 1: `cd backend && uvicorn main:app --reload --port 8000`
8. เปิด terminal ที่ 2: `cd frontend && npm run dev`
9. รัน `pytest` (จาก `backend/`), `npm test` (จาก `frontend/`), `npx playwright test` (จาก root) แยกกัน

→ **9 ขั้นตอน ~20-25 นาที** (นับเฉพาะติดตั้ง ไม่รวมเวลาหาว่าทำไม terminal ไหนพัง)

## After (WS-05)

```bash
docker compose up
```

→ **1 คำสั่ง** — ทั้ง frontend (`:5173`), backend (`:8000`), และ Postgres (`:5432`) รันพร้อมกัน
ครั้งแรก (ต้อง build image) ใช้เวลาประมาณ 2-3 นาที ครั้งถัดไป (image cache แล้ว) ประมาณ 15-20 วินาที

รัน test suite ทั้งหมดโดยไม่ต้องติดตั้งอะไรบนเครื่องเลย:

```bash
docker compose -f compose.test.yaml up unit --abort-on-container-exit --exit-code-from unit
docker compose -f compose.test.yaml --profile e2e up e2e --abort-on-container-exit --exit-code-from e2e
docker compose -f compose.test.yaml down -v
```

## หมายเหตุ

- `DATABASE_URL`/Postgres container ถูกเตรียมไว้แล้วใน `compose.yaml` และ `compose.test.yaml` แต่
  backend ยังไม่ได้เชื่อมต่อจริง (ยังเก็บข้อมูลแบบ in-memory) — ดู tech-debt TD-2 ใน
  `docs/backlog.md` เมื่อไรที่ต่อจริง ไม่ต้องแก้ compose file เพิ่ม
- ตัวเลข "ครั้งแรก / ครั้งถัดไป" วัดจากเครื่องที่ build image ของ repo นี้มาแล้วอย่างน้อยหนึ่งครั้ง
  (Docker layer cache ทำให้ครั้งถัดไปเร็วขึ้นมาก)
