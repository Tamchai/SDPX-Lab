# Test Plan

รายการนี้ลอกมาจาก section *Key Business Rules* ใน `memory-bank/units/booking/unit-brief.md` และ
`memory-bank/units/auth/unit-brief.md` โดยตรง — ทุกกฎในนั้นมีบรรทัดของตัวเองที่นี่

## Functions ที่ต้อง Test

1. `BookingService.create_booking()` (`backend/services/booking_service.py`)
   - ห้องว่างและช่วงเวลาถูกต้อง → booking `confirmed`
   - `end_at <= start_at` → `InvalidTimeRangeError`
   - จองย้อนหลัง (`start_at` อยู่ในอดีต) → `InvalidTimeRangeError`
   - จองเกิน 14 วันล่วงหน้า → `InvalidTimeRangeError`
   - ห้องไม่ exists หรือถูกปิดใช้งาน (`is_active=False`) → `RoomNotFoundError`
   - ช่วงเวลาชนกับ booking อื่นที่ `status=confirmed` → `RoomNotAvailableError`
   - ผู้ใช้มี active booking ครบ 3 รายการแล้ว → `ActiveBookingLimitError`
   - ยกเลิก booking หนึ่งรายการแล้วจองใหม่ได้อีกครั้ง (limit นับเฉพาะ active)

2. `BookingService.cancel_booking()` (`backend/services/booking_service.py`)
   - เจ้าของ booking ยกเลิกก่อนเวลาเริ่มเกิน 1 ชั่วโมง → status เป็น `cancelled`
   - booking ของคนอื่น → `ForbiddenError`
   - booking ไม่ exists → `BookingNotFoundError`
   - เหลือเวลาน้อยกว่า 1 ชั่วโมงก่อนเริ่ม → `CancellationWindowPassedError`

3. `AuthService.login()` (`backend/services/auth_service.py`)
   - email + password ถูกต้อง → ได้ token และ user กลับมา
   - password ผิด → `InvalidCredentialsError`
   - email ไม่ exists → `InvalidCredentialsError` (ข้อความเดียวกับ password ผิด กัน user enumeration)

4. `AuthService.user_from_token()` (`backend/services/auth_service.py`)
   - token ที่ถูก sign ถูกต้องและยังไม่หมดอายุ → คืน user ที่ตรงกัน
   - token ปลอม/แก้ไข signature → `InvalidTokenError`

## กฎที่ยังไม่มี test (ยอมรับไว้ชั่วคราว)

- Race condition เมื่อสอง request จองห้องเดียวกันพร้อมกัน (TD-1 ใน `docs/backlog.md`) —
  ยังไม่มี test เพราะ in-memory repository ปัจจุบันไม่ได้ทดสอบ concurrency จริง จะกลับมาทำตอน
  ตัดสินใจเรื่อง DB-level locking

## Fidelity Check (WS-03)

- ลบกฎ: overlap check ใน `BookingService.create_booking()` (comment บรรทัด
  `if self._booking_repo.find_overlapping(...)`)
- Test ที่แดง: `test_create_booking_rejects_when_room_already_booked_in_overlapping_range`
  ✅ harness ปกป้องกฎนี้ (verified 2026-09-14 — comment เงื่อนไขออกจริง รัน `pytest` แล้วเห็น
  1 failed/18 passed ตรงตัวที่คาดไว้ ก่อน uncomment คืน แล้วรันซ้ำเห็น 19 passed)

## Coverage

รันด้วย `pytest --cov=. --cov-report=term-missing --cov-report=html:docs/coverage` จาก
`backend/` — HTML report อยู่ที่ `docs/coverage/index.html`
