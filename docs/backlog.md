# Product Backlog — Room Booking

ไฟล์นี้คือร่าง backlog สำหรับ copy เข้า GitHub Issues (repo นี้ไม่มี `gh` CLI ติดตั้ง/login
ในเครื่องที่ generate ไฟล์นี้ จึงสร้างเป็น Markdown ไว้ก่อน — ดูขั้นตอนสร้างจริงท้ายไฟล์)

Labels ที่ต้องสร้างใน GitHub ก่อน: `user-story`, `bug`, `enhancement`, `tech-debt`

---

## Core Stories (เขียนเองก่อนถาม AI)

### US-1: นักศึกษาเข้าสู่ระบบ
**Label:** `user-story`

As a student, I want to log in with my email and password, so that the system
knows who is making a booking.

**Acceptance Criteria**
- Given a registered email and correct password, when I submit the login form,
  then I receive a session token and am redirected to the room list.
- Given a wrong password, when I submit the login form, then I see an error
  message and stay on the login page.

**Definition of Done**
- [ ] Feature ทำงานได้ตาม acceptance criteria
- [ ] มี unit test ครอบคลุม business rule ของ story นี้
- [ ] มี E2E test สำหรับ AC อย่างน้อย 1 ข้อ
- [ ] Code ผ่าน review จากสมาชิกในกลุ่ม
- [ ] Deploy ขึ้น staging แล้วเปิดใช้ได้จริง

---

### US-2: ดูรายการห้องและสถานะว่าง
**Label:** `user-story`

As a student, I want to see a list of rooms with their availability, so that I
can pick a room to book.

**Acceptance Criteria**
- Given I am logged in, when I open the room list page, then I see every active
  room with name, building, and capacity.
- Given a room has a confirmed booking overlapping the current time, when I view
  the room list, then that room is marked as unavailable right now.

**Definition of Done:** เหมือน US-1

---

### US-3: จองห้อง
**Label:** `user-story`

As a student, I want to book a room for a specific date and time range, so that
I can use it for study or meeting.

**Acceptance Criteria**
- Given a room is free for the whole requested time range, when I submit a
  booking with a valid start/end time, then the booking is created with status
  `confirmed` and I see a success message.
- Given I submit a booking with `end_at` before or equal to `start_at`, when I
  submit, then I see a validation error and no booking is created.

**Definition of Done:** เหมือน US-1

---

### US-4: ดูรายการจองของตัวเอง
**Label:** `user-story`

As a student, I want to see my current and upcoming bookings, so that I can
keep track of my reservations.

**Acceptance Criteria**
- Given I have 2 confirmed bookings in the future, when I open "my bookings",
  then I see both, sorted by start time.
- Given I have a cancelled booking, when I open "my bookings", then it does
  not appear in the default (active) view.

**Definition of Done:** เหมือน US-1

---

### US-5: ยกเลิกการจองของตัวเอง
**Label:** `user-story`

As a student, I want to cancel my own booking, so that I can free up the room
if my plans change.

**Acceptance Criteria**
- Given I own a confirmed future booking, when I cancel it, then its status
  becomes `cancelled` and the room becomes available again for that slot.
- Given a booking belongs to another student, when I try to cancel it, then I
  get a `403 Forbidden` and the booking is unchanged.

**Definition of Done:** เหมือน US-1

---

## AI-Suggested Edge Cases — Review

Prompt ที่ใช้ถาม AI (หลังเขียน US-1 ถึง US-5 เองก่อน):

> Here are my user stories for a campus room booking system: [US-1..US-5].
> What edge cases, error scenarios, or missing requirements should I consider?
> List at least 5 specific cases. For each, tell me what could go wrong in
> production if I ignore it.

ผลการคัดกรอง (คนตัดสินใจ ไม่ใช่ AI):

| # | ข้อเสนอจาก AI | ตัดสินใจ | เหตุผล |
|---|---|---|---|
| 1 | จองห้องที่ชนกับ booking อื่นที่ยัง confirmed อยู่ (double-booking) | **รับ** → US-6 | ถ้าไม่กัน สองคนจะได้ห้องเดียวกันช่วงเวลาเดียวกัน เป็น core requirement ที่พลาดไม่ได้ |
| 2 | จองย้อนหลัง หรือจองไกลเกินไป (ไม่มีขอบเขตเวลา) | **รับ** → US-7 | ไม่มี limit จะทำให้ห้องถูกยึดข้ามเทอม ตรงกับคำตอบใน `docs/spec-questions.md` (14 วัน) |
| 3 | นักศึกษาคนเดียวจองรวบหลายห้อง/หลาย slot ไม่จำกัด | **รับ** → US-8 | ไม่มี limit คนเดียวจะยึดห้องทั้งหมดได้ ตรงกับคำตอบใน `docs/spec-questions.md` (max 3) |
| 4 | ยกเลิกกระชั้นชิดเกินไป (เช่น ยกเลิกตอนใกล้ถึงเวลา) | **รับ** → US-9 | ถ้ายกเลิกได้ถึงวินาทีสุดท้าย ห้องที่ปล่อยคืนมาจะหาคนจองใหม่ไม่ทัน ตรงกับคำตอบ 1 ชั่วโมงก่อนเริ่ม |
| 5 | แนะนำห้องที่เหมาะกับขนาดกลุ่มอัตโนมัติ (smart recommendation) | **ไม่รับ** | เกินความจำเป็นของ MVP เทอมนี้ ไม่มี story ไหนต้องการ ป้องกัน scope creep |
| 6 | แจ้งเตือนอีเมล/LINE เมื่อใกล้ถึงเวลาจองหรือถูกยกเลิก | **ไม่รับ** | ระบุไว้แล้วใน `memory-bank/intent.md` ว่าอยู่นอกขอบเขตเทอมนี้ |
| 7 | จัดการ race condition เมื่อสองคน submit booking พร้อมกันในระดับ database (เช่น ใช้ unique constraint / row lock) | **ยังไม่ตัดสิน** | รู้ว่าสำคัญ แต่ยังไม่รู้ว่าจะ implement ระดับ DB constraint หรือ application-level lock — ใส่ label `tech-debt` ไว้ก่อน แล้วตัดสินใจตอนออกแบบ `booking` unit ใน WS-03 |

---

### US-6: ปฏิเสธการจองที่ชนกับ booking อื่น
**Label:** `user-story`

As a student, I want to be blocked from booking a room that's already reserved
for an overlapping time, so that I don't accidentally create a conflicting
reservation.

**Acceptance Criteria**
- Given a room already has a confirmed booking from 13:00–15:00, when another
  student tries to book that room for 14:00–16:00, then the request is
  rejected with a conflict error and no new booking is created.

**Definition of Done:** เหมือน US-1

---

### US-7: ปฏิเสธการจองนอกช่วงเวลาที่อนุญาต
**Label:** `user-story`

As a student, I want to be blocked from booking a room in the past or more
than 14 days ahead, so that the booking window stays predictable and fair.

**Acceptance Criteria**
- Given the current time, when I try to book a slot that already started or
  ended in the past, then I get a validation error.
- Given today's date, when I try to book a slot more than 14 days from now,
  then I get a validation error naming the 14-day limit.

**Definition of Done:** เหมือน US-1

---

### US-8: จำกัดจำนวน booking ที่ active พร้อมกัน
**Label:** `user-story`

As a student, I want to be blocked from creating a 4th active booking, so that
one student can't monopolize multiple rooms at once.

**Acceptance Criteria**
- Given I already have 3 confirmed future bookings, when I try to create a
  4th, then the request is rejected with a conflict error explaining the
  3-booking limit.
- Given I have 3 confirmed bookings but cancel one, when I try to book again,
  then the new booking succeeds.

**Definition of Done:** เหมือน US-1

---

### US-9: ปฏิเสธการยกเลิกที่กระชั้นชิดเกินไป
**Label:** `user-story`

As a student, I want to be blocked from cancelling a booking less than 1 hour
before it starts, so that rooms freed up too late still can't be re-booked in
time, and my cancellation history stays meaningful.

**Acceptance Criteria**
- Given a confirmed booking starting in 30 minutes, when I try to cancel it,
  then I get a validation error and the booking stays `confirmed`.
- Given a confirmed booking starting in 2 hours, when I cancel it, then it
  becomes `cancelled`.

**Definition of Done:** เหมือน US-1

---

## Tech Debt (ยังไม่ตัดสิน)

### TD-1: Race condition ตอนสอง request จองพร้อมกัน
**Label:** `tech-debt`

จองสองรายการที่ชนกันถูกส่งมาพร้อมกัน (concurrent) อาจหลุดผ่าน conflict check ถ้าตรวจแบบ
read-then-write ธรรมดา ต้องตัดสินใจว่าจะใช้ DB-level unique/exclusion constraint หรือ
application-level lock — ตัดสินใจตอนออกแบบ `booking` unit (ดู
`memory-bank/units/booking/unit-brief.md`)

### TD-2: ต่อ persistence จาก in-memory ไปยัง Postgres จริง
**Label:** `tech-debt`

`compose.yaml`/`compose.test.yaml` (WS-05) ตั้ง Postgres container และ `DATABASE_URL` ไว้แล้ว
แต่ `backend/repositories.py` ยังเก็บข้อมูลแบบ in-memory (`InMemoryRoomRepository` ฯลฯ) — ข้อมูล
หายทุกครั้งที่ container restart ต้องตัดสินใจว่าจะใช้ ORM ไหน (SQLAlchemy) และ migration tool ไหน
ก่อนต่อจริง

---

## วิธีสร้างเป็น GitHub Issues จริง

เครื่องนี้ไม่มี `gh` CLI ติดตั้ง/login — เลือกวิธีใดวิธีหนึ่ง:

**วิธี A — ผ่านเว็บ (เร็วสุดสำหรับ 9 issues):**
ไปที่ repo > Issues > New Issue > copy หัวข้อและเนื้อหาแต่ละ story จากไฟล์นี้ > ใส่ label ตามที่ระบุ

**วิธี B — ผ่าน `gh` CLI (ถ้าติดตั้งแล้วในเครื่องของสมาชิกกลุ่ม):**
```bash
gh label create user-story --color "0E8A16"
gh label create tech-debt  --color "D93F0B"

gh issue create --title "US-1: นักศึกษาเข้าสู่ระบบ" \
  --body-file - --label user-story <<'EOF'
As a student, I want to log in with my email and password, so that the
system knows who is making a booking.

## Acceptance Criteria
- Given a registered email and correct password, when I submit the login
  form, then I receive a session token and am redirected to the room list.
- Given a wrong password, when I submit the login form, then I see an error
  message and stay on the login page.
EOF
```
ทำซ้ำสำหรับ US-2 ถึง US-9 และ TD-1 (เปลี่ยน `--label tech-debt` สำหรับ TD-1)
