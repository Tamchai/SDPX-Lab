from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class User:
    id: int
    email: str
    password_hash: str
    full_name: str
    created_at: datetime = field(default_factory=utcnow)


@dataclass
class Room:
    id: int
    name: str
    building: str
    capacity: int
    is_active: bool = True


@dataclass
class Booking:
    id: int
    room_id: int
    user_id: int
    start_at: datetime
    end_at: datetime
    status: str = "confirmed"
    created_at: datetime = field(default_factory=utcnow)
