# Unit: Room Catalog

## Purpose
เก็บและให้บริการข้อมูลรายชื่อห้อง (ชื่อ, อาคาร, ความจุ, สถานะเปิด/ปิดใช้งาน) สำหรับให้ unit
อื่นและหน้า UI ใช้แสดงผล

## Responsibilities
- คืนรายการห้องที่ `is_active = true` ทั้งหมด พร้อม metadata (ชื่อ, อาคาร, ความจุ)
- ยืนยันว่า room id ที่ถูกอ้างถึงมีอยู่จริงและยัง active เมื่อ unit อื่น (เช่น `booking`) ถามมา
- (ในเทอมนี้) ข้อมูลห้องถูก seed ไว้ล่วงหน้าในฐานข้อมูล ไม่มีหน้า UI สำหรับแก้ไข

## NOT Responsible For
- ไม่คำนวณว่าห้องว่างหรือไม่ในช่วงเวลาใดเวลาหนึ่ง (เป็นหน้าที่ของ unit `booking` ซึ่งเป็นเจ้าของ
  ข้อมูล booking)
- ไม่มี endpoint สำหรับสร้าง/แก้ไข/ลบห้อง (ฟีเจอร์แอดมิน อยู่นอกขอบเขตของเทอมนี้ ดู
  `memory-bank/intent.md`)

## Dependencies
- Depends on: — (ไม่พึ่ง unit อื่น)
- Used by: `booking` (ตรวจสอบ room id ที่ขอจอง), FastAPI route layer (`GET /rooms`)

## Key Business Rules
- ห้องที่ `is_active = false` ต้องไม่ปรากฏในผลลัพธ์ `GET /rooms` และต้องถูกปฏิเสธถ้ามีคนพยายาม
  จองห้องนั้น

## Key Stories
- US-2 — ดู `docs/backlog.md`

## Bolt Type
[ ] DDD Construction — ถ้า domain logic ซับซ้อน
[x] Simple Construction — ถ้าเป็น UI, integration, utility
