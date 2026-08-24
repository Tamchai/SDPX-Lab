# Tech Stack

## Decision Summary
ทีม: [ชื่อสมาชิก]
Domain: Room Booking — ระบบจองห้องเรียน/ห้องประชุมมหาวิทยาลัย
Date: 2026-08-24

## Frontend
- Framework: React (Vite)
- Language: TypeScript
- Styling: Tailwind CSS
- Rationale: แยก concern จาก backend ชัดเจน, เทียบ FastAPI ได้ตรงตามที่เอกสารแนะนำ

## Backend
- Framework: FastAPI
- Language: Python 3.12
- Rationale: type hints + auto OpenAPI generation ช่วยขั้น WS-02 (API Design) ได้โดยตรง

## Database
- PostgreSQL (ผ่าน Docker ในเครื่อง dev)
- Rationale: รองรับ relational data (User–Room–Booking) และใช้ฝึก Docker ตาม WS-01--before

## Deployment
- Platform: Render (FastAPI backend) + Vercel (React frontend) หรือ Render สำหรับทั้งคู่
- Staging URL: [จะเพิ่มหลัง deploy]
- Commit-to-live time: [จะวัดในขั้นตอนที่ 5]

## AI Tools
- Agent ที่ใช้: [ระบุ]
- Review policy: ทุก AI-generated code ต้องอ่านและอธิบายได้ก่อน commit
