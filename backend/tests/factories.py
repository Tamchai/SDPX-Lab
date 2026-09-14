from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from models import Booking, Room, User
from services.auth_service import hash_password

# PBKDF2 hashing is deliberately slow; hash "password123" once and reuse it so
# the unit suite doesn't pay that cost per test (see TEST_PLAN.md's <10s budget).
_DEFAULT_PASSWORD_HASH = hash_password("password123")


def make_room(**overrides: Any) -> Room:
    defaults: dict[str, Any] = {
        "id": 1,
        "name": "A101",
        "building": "อาคาร A",
        "capacity": 10,
        "is_active": True,
    }
    return Room(**{**defaults, **overrides})


def make_user(**overrides: Any) -> User:
    defaults: dict[str, Any] = {
        "id": 1,
        "email": "student@test.com",
        "password_hash": _DEFAULT_PASSWORD_HASH,
        "full_name": "Test Student",
    }
    return User(**{**defaults, **overrides})


def make_booking(**overrides: Any) -> Booking:
    now = datetime.now(timezone.utc)
    defaults: dict[str, Any] = {
        "id": 1,
        "room_id": 1,
        "user_id": 1,
        "start_at": now + timedelta(days=1),
        "end_at": now + timedelta(days=1, hours=1),
        "status": "confirmed",
    }
    return Booking(**{**defaults, **overrides})
