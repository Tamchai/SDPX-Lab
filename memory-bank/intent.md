# Intent: Campus Room Booking Service

## Intent Statement
Enable university students to book study rooms and meeting rooms online,
reducing manual processes (walk-in / phone requests) and room double-booking conflicts.

## Business Context
- **Problem:** นักศึกษาไม่มีช่องทางออนไลน์สำหรับจองห้องเรียน/ห้องประชุมที่ว่าง ต้องเดินไปถามหรือโทรถาม
  ทำให้เกิดการจองซ้อนและใช้เวลานาน
- **Users:** นักศึกษา (ผู้จอง/ยกเลิกการจอง) เป็นกลุ่มหลักของ course นี้
  เจ้าหน้าที่ดูแลห้อง (ผู้ดูแลรายการห้อง) อยู่นอกขอบเขตของเทอมนี้ — ดู Out of Scope
- **Value:** ลดเวลาที่ใช้ในการหาและจองห้องว่าง, ลดการจองซ้อน, มีประวัติการจองที่ตรวจสอบย้อนหลังได้

## Success Criteria
- [ ] นักศึกษาดูรายการห้องและสถานะว่าง/ไม่ว่างได้จากหน้าเว็บ โดยไม่ต้องถามเจ้าหน้าที่
- [ ] การจองห้องที่ชนกับ booking อื่นที่ active อยู่ถูกระบบปฏิเสธเสมอ (ไม่มี double-booking หลุดผ่าน)
- [ ] นักศึกษายกเลิกการจองของตัวเองได้ และเห็นรายการจองปัจจุบันของตัวเองได้
- [ ] Deploy loop ปิดครบวง — commit ขึ้น `develop` แล้วเห็นการเปลี่ยนแปลงบน staging URL โดยไม่ต้องกดปุ่ม deploy เอง

## Decisions Already Made
- Stack: React (Vite) + TypeScript ฝั่ง frontend, FastAPI + Python 3.12 ฝั่ง backend,
  PostgreSQL เป็น database (ดู `memory-bank/standards/tech-stack.md`)
- จองล่วงหน้าได้ไม่เกิน **14 วัน** นับจากวันที่จอง — กันไม่ให้ยึดห้องข้ามเทอมทั้งเทอม
- ยกเลิกการจองได้จนถึง **1 ชั่วโมงก่อนเวลาเริ่ม** เท่านั้น — หลังจากนั้นถือว่า booking ล็อกแล้ว
  (เคส no-show อยู่นอกขอบเขตของเทอมนี้)
- นักศึกษา 1 คนมี booking ที่ยัง **active (confirmed และยังไม่ถึงเวลาสิ้นสุด) ได้สูงสุด 3 รายการ**
  พร้อมกัน — กันไม่ให้คนเดียวยึดห้องรวบ
- คำตอบทั้ง 3 ข้อนี้มาจาก `docs/spec-questions.md` (ตัดสินใจแทน stakeholder จริง เนื่องจากเป็น course
  exercise — ถ้ามี stakeholder จริงในอนาคตต้องยืนยันค่าเหล่านี้ใหม่)
- Authentication ใช้ email + password แบบง่าย ออก JWT เอง (ไม่ผูก SSO ของมหาวิทยาลัยในเทอมนี้)

## Out of Scope
- ระบบสำหรับเจ้าหน้าที่ (แอดมิน) เพิ่ม/แก้ไข/ลบห้อง — ข้อมูลห้องใน MVP นี้ seed ไว้ล่วงหน้า
- การเชื่อมต่อ Single Sign-On (SSO) ของมหาวิทยาลัย
- การแจ้งเตือนผ่านอีเมล/LINE เมื่อใกล้ถึงเวลาจองหรือถูกยกเลิก
- การจองซ้ำแบบ recurring (จองทุกสัปดาห์อัตโนมัติ)
- รายงาน/สถิติการใช้งานห้องสำหรับผู้บริหาร

## Status
In Progress — WS-02
