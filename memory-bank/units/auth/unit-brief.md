# Unit: Auth

## Purpose
ยืนยันตัวตนนักศึกษาด้วยอีเมล/รหัสผ่าน และออก token ที่ unit อื่นใช้ระบุตัวผู้เรียกได้

## Responsibilities
- ตรวจสอบ email + password ที่ส่งมากับ `POST /auth/login` กับข้อมูลที่เก็บไว้ (password hash)
- ออก bearer token (JWT) เมื่อยืนยันตัวตนสำเร็จ พร้อมกำหนดเวลาหมดอายุ
- ให้ฟังก์ชัน/middleware สำหรับ route อื่นใช้ตรวจสอบ token และดึง user id ออกมา

## NOT Responsible For
- ไม่เก็บหรือดูแลข้อมูล booking หรือ room ใด ๆ
- ไม่ผูกกับ Single Sign-On (SSO) ของมหาวิทยาลัยในเทอมนี้ (ดู Out of Scope ใน
  `memory-bank/intent.md`) — ใช้ email/password ของระบบเองไปก่อน
- ไม่มีขั้นตอนสมัครสมาชิกอัตโนมัติผ่านหน้าเว็บ (สร้าง user เริ่มต้นด้วย seed/migration)

## Dependencies
- Depends on: — (ไม่พึ่ง unit อื่น)
- Used by: `booking` และทุก route ที่ต้องรู้ว่าใครเป็นผู้เรียก (ผ่าน token verification)

## Key Business Rules
- Login ผิดรหัสผ่านต้องไม่บอกว่า "email ไม่พบ" หรือ "password ผิด" แยกกัน (กัน user enumeration)
  ตอบเป็นข้อความรวมเดียวกันเสมอ
- Token ที่หมดอายุหรือไม่ถูกต้องต้องถูกปฏิเสธด้วย `401 Unauthorized` ในทุก endpoint ที่ต้อง
  authenticate

## Key Stories
- US-1 — ดู `docs/backlog.md`

## Bolt Type
[ ] DDD Construction — ถ้า domain logic ซับซ้อน
[x] Simple Construction — ถ้าเป็น UI, integration, utility
