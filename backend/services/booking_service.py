from __future__ import annotations

from datetime import datetime, timedelta, timezone

from errors import (
    ActiveBookingLimitError,
    CancellationWindowPassedError,
    ForbiddenError,
    InvalidTimeRangeError,
    RoomNotAvailableError,
    RoomNotFoundError,
    BookingNotFoundError,
)
from models import Booking
from repositories import BookingRepository, RoomRepository

MAX_ADVANCE_BOOKING = timedelta(days=14)
MAX_ACTIVE_BOOKINGS_PER_USER = 3
MIN_CANCELLATION_NOTICE = timedelta(hours=1)


def _now() -> datetime:
    return datetime.now(timezone.utc)


class BookingService:
    def __init__(self, room_repo: RoomRepository, booking_repo: BookingRepository) -> None:
        self._room_repo = room_repo
        self._booking_repo = booking_repo

    def create_booking(
        self,
        *,
        room_id: int,
        user_id: int,
        start_at: datetime,
        end_at: datetime,
        now: datetime | None = None,
    ) -> Booking:
        now = now or _now()

        if end_at <= start_at:
            raise InvalidTimeRangeError("end_at must be after start_at")
        if start_at < now:
            raise InvalidTimeRangeError("cannot book a time slot in the past")
        if start_at > now + MAX_ADVANCE_BOOKING:
            raise InvalidTimeRangeError("cannot book more than 14 days in advance")

        room = self._room_repo.find_by_id(room_id)
        if room is None or not room.is_active:
            raise RoomNotFoundError(f"room {room_id} not found")

        if self._booking_repo.find_overlapping(room_id, start_at, end_at):
            raise RoomNotAvailableError("this room is not available for the selected time")

        if (
            self._booking_repo.count_active_for_user(user_id, now)
            >= MAX_ACTIVE_BOOKINGS_PER_USER
        ):
            raise ActiveBookingLimitError(
                f"you already have {MAX_ACTIVE_BOOKINGS_PER_USER} active bookings"
            )

        booking = Booking(
            id=0,
            room_id=room_id,
            user_id=user_id,
            start_at=start_at,
            end_at=end_at,
            status="confirmed",
        )
        return self._booking_repo.save(booking)

    def cancel_booking(
        self, *, booking_id: int, user_id: int, now: datetime | None = None
    ) -> Booking:
        now = now or _now()

        booking = self._booking_repo.find_by_id(booking_id)
        if booking is None:
            raise BookingNotFoundError(f"booking {booking_id} not found")
        if booking.user_id != user_id:
            raise ForbiddenError("you can only cancel your own bookings")
        if booking.start_at - now < MIN_CANCELLATION_NOTICE:
            raise CancellationWindowPassedError(
                "cannot cancel less than 1 hour before the start time"
            )

        booking.status = "cancelled"
        return self._booking_repo.save(booking)

    def list_my_bookings(self, *, user_id: int) -> list[Booking]:
        return self._booking_repo.list_for_user(user_id)
