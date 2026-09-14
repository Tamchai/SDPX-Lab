from __future__ import annotations

from datetime import datetime
from typing import Protocol

from models import Booking, Room, User


class RoomRepository(Protocol):
    def find_by_id(self, room_id: int) -> Room | None: ...

    def list_active(self) -> list[Room]: ...


class BookingRepository(Protocol):
    def find_by_id(self, booking_id: int) -> Booking | None: ...

    def find_overlapping(
        self, room_id: int, start_at: datetime, end_at: datetime
    ) -> list[Booking]: ...

    def count_active_for_user(self, user_id: int, now: datetime) -> int: ...

    def list_for_user(self, user_id: int) -> list[Booking]: ...

    def save(self, booking: Booking) -> Booking: ...


class UserRepository(Protocol):
    def find_by_id(self, user_id: int) -> User | None: ...

    def find_by_email(self, email: str) -> User | None: ...

    def save(self, user: User) -> User: ...


class InMemoryRoomRepository:
    def __init__(self, rooms: list[Room] | None = None) -> None:
        self._rooms: dict[int, Room] = {r.id: r for r in (rooms or [])}

    def find_by_id(self, room_id: int) -> Room | None:
        return self._rooms.get(room_id)

    def list_active(self) -> list[Room]:
        return [r for r in self._rooms.values() if r.is_active]

    def replace_all(self, rooms: list[Room]) -> None:
        self._rooms = {r.id: r for r in rooms}


class InMemoryBookingRepository:
    def __init__(self, bookings: list[Booking] | None = None) -> None:
        self._bookings: dict[int, Booking] = {b.id: b for b in (bookings or [])}
        self._next_id = max(self._bookings, default=0) + 1

    def find_by_id(self, booking_id: int) -> Booking | None:
        return self._bookings.get(booking_id)

    def find_overlapping(
        self, room_id: int, start_at: datetime, end_at: datetime
    ) -> list[Booking]:
        return [
            b
            for b in self._bookings.values()
            if b.room_id == room_id
            and b.status == "confirmed"
            and b.start_at < end_at
            and start_at < b.end_at
        ]

    def count_active_for_user(self, user_id: int, now: datetime) -> int:
        return sum(
            1
            for b in self._bookings.values()
            if b.user_id == user_id and b.status == "confirmed" and b.end_at > now
        )

    def list_for_user(self, user_id: int) -> list[Booking]:
        return sorted(
            (b for b in self._bookings.values() if b.user_id == user_id),
            key=lambda b: b.start_at,
        )

    def save(self, booking: Booking) -> Booking:
        if booking.id == 0:
            booking.id = self._next_id
            self._next_id += 1
        self._bookings[booking.id] = booking
        return booking

    def clear(self) -> None:
        self._bookings = {}
        self._next_id = 1


class InMemoryUserRepository:
    def __init__(self, users: list[User] | None = None) -> None:
        self._users: dict[int, User] = {u.id: u for u in (users or [])}

    def find_by_id(self, user_id: int) -> User | None:
        return self._users.get(user_id)

    def find_by_email(self, email: str) -> User | None:
        return next((u for u in self._users.values() if u.email == email), None)

    def save(self, user: User) -> User:
        self._users[user.id] = user
        return user

    def replace_all(self, users: list[User]) -> None:
        self._users = {u.id: u for u in users}
