# Unit: Booking

## Purpose
จัดการวงจรชีวิตของการจองห้อง (สร้าง, ยกเลิก, แสดงรายการ) และบังคับใช้กฎทางธุรกิจทั้งหมดที่
เกี่ยวกับการจอง

## Responsibilities
- รับคำขอสร้าง booking, ตรวจสอบว่าช่วงเวลาที่ขอถูกต้อง (start < end, ไม่ย้อนหลัง, ไม่เกิน 14 วัน
  ข้างหน้า)
- เช็คว่าห้องที่ขอว่างจริงในช่วงเวลานั้น (ไม่ชนกับ booking อื่นที่ `status = confirmed`)
- เช็คว่าผู้ใช้ยังมี active booking ไม่เกิน 3 รายการ ก่อนอนุมัติ booking ใหม่
- ยกเลิก booking ของเจ้าของเท่านั้น และเฉพาะเมื่อยังเหลือเวลาอย่างน้อย 1 ชั่วโมงก่อนเริ่ม
- คืนรายการ booking ของ user คนหนึ่ง (ปัจจุบัน + อนาคต) เรียงตามเวลาเริ่ม

## NOT Responsible For
- ไม่เก็บหรือดูแลรายชื่อห้อง/ความจุห้อง (เป็นหน้าที่ของ unit `room-catalog`)
- ไม่ตรวจสอบตัวตนผู้ใช้หรือออก token (เป็นหน้าที่ของ unit `auth`) — รับ user id ที่ authenticate
  แล้วมาจากชั้น API เท่านั้น
- ไม่ส่งอีเมล/แจ้งเตือนใด ๆ (อยู่นอกขอบเขตของเทอมนี้ ดู `memory-bank/intent.md`)

## Dependencies
- Depends on: `room-catalog` (เพื่อยืนยันว่า room id ที่ขอจองมีอยู่จริงและ `is_active`), `auth`
  (เพื่อรับ user id ที่ยืนยันตัวตนแล้ว)
- Used by: FastAPI route layer (`POST /bookings`, `DELETE /bookings/{id}`, `GET /bookings/me`)

## Key Business Rules
- ห้ามมี booking สองรายการที่ `room_id` เดียวกัน, `status = confirmed`, และช่วงเวลาทับกัน
- ห้ามจองย้อนหลัง และห้ามจองเกิน 14 วันล่วงหน้า
- ผู้ใช้ 1 คนมี booking ที่ `status = confirmed` และยังไม่ถึงเวลาสิ้นสุด ได้ไม่เกิน 3 รายการพร้อมกัน
- ยกเลิกได้เฉพาะเจ้าของ booking และต้องยกเลิกก่อนเวลาเริ่มอย่างน้อย 1 ชั่วโมง
- (tech-debt — ยังไม่ตัดสิน) วิธีป้องกัน race condition เมื่อสอง request จองห้องเดียวกันพร้อมกัน
  ดู `docs/backlog.md` รายการ TD-1

## Key Stories
- US-3, US-4, US-5, US-6, US-7, US-8, US-9 — ดู `docs/backlog.md`

## Bolt Type
[x] DDD Construction — ถ้า domain logic ซับซ้อน
[ ] Simple Construction — ถ้าเป็น UI, integration, utility
