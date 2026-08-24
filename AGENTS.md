# AGENTS.md

## Project
ระบบจองห้องเรียน/ห้องประชุมสำหรับนักศึกษาในมหาวิทยาลัย — รายละเอียดดู memory-bank/intent.md

## Setup & Commands
- install (backend): `pip install -r requirements.txt`
- install (frontend): `npm ci`
- dev (backend): `uvicorn main:app --reload`
- dev (frontend): `npm run dev`
- test (backend): `pytest`
- test (frontend): `npm test`
- lint (backend): `ruff check .`
- lint (frontend): `npm run lint`
- build (frontend): `npm run build`

## Conventions
- Backend: Python 3.12 + type hints
- Frontend: TypeScript strict mode, ห้ามใช้ `any`
- ใช้ `data-testid` กับ element ที่ E2E test จะอ้างถึง เฉพาะจุดที่ไม่มี role/label ที่เสถียร
- Commit ตาม Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`)
- Branch: ทำงานบน `feature/*` แล้ว PR เข้า `develop`

## Rules for agents
- ต้องรัน test ให้เขียวก่อนเสนอ diff เสมอ
- ถ้า test แดง ให้แก้ code — ห้ามแก้หรือลบ test เพื่อให้ผ่าน
- ห้ามใส่ค่า secret ลงไฟล์ใด ๆ ใช้ env var เท่านั้น
- ห้ามแก้ `docs/adr/` และ `memory-bank/` โดยไม่ถามก่อน
- แก้ทีละเรื่อง — diff ที่เกิน ~200 บรรทัดให้หยุดถามก่อน
- endpoint ที่ขึ้นต้นด้วย `/api/test/*` ต้องปิดใน production (return 404 เมื่อ NODE_ENV/ENV=production)
