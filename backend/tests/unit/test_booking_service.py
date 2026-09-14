from datetime import timedelta

import pytest

from errors import (
    ActiveBookingLimitError,
    CancellationWindowPassedError,
    ForbiddenError,
    InvalidTimeRangeError,
    RoomNotAvailableError,
    RoomNotFoundError,
    BookingNotFoundError,
)
from services.booking_service import BookingService


@pytest.fixture
def service(room_repo, booking_repo):
    return BookingService(room_repo, booking_repo)


def test_create_booking_confirms_when_room_is_available(service, available_room, student, now):
    booking = service.create_booking(
        room_id=available_room.id,
        user_id=student.id,
        start_at=now + timedelta(hours=1),
        end_at=now + timedelta(hours=2),
        now=now,
    )

    assert booking.status == "confirmed"
    assert booking.room_id == available_room.id


def test_create_booking_rejects_when_end_before_start(service, available_room, student, now):
    with pytest.raises(InvalidTimeRangeError):
        service.create_booking(
            room_id=available_room.id,
            user_id=student.id,
            start_at=now + timedelta(hours=2),
            end_at=now + timedelta(hours=1),
            now=now,
        )


def test_create_booking_rejects_time_in_the_past(service, available_room, student, now):
    with pytest.raises(InvalidTimeRangeError):
        service.create_booking(
            room_id=available_room.id,
            user_id=student.id,
            start_at=now - timedelta(hours=1),
            end_at=now + timedelta(hours=1),
            now=now,
        )


def test_create_booking_rejects_more_than_14_days_ahead(service, available_room, student, now):
    with pytest.raises(InvalidTimeRangeError):
        service.create_booking(
            room_id=available_room.id,
            user_id=student.id,
            start_at=now + timedelta(days=15),
            end_at=now + timedelta(days=15, hours=1),
            now=now,
        )


def test_create_booking_rejects_when_room_missing_or_inactive(
    service, inactive_room, room_repo, student, now
):
    room_repo.replace_all([inactive_room])

    with pytest.raises(RoomNotFoundError):
        service.create_booking(
            room_id=inactive_room.id,
            user_id=student.id,
            start_at=now + timedelta(hours=1),
            end_at=now + timedelta(hours=2),
            now=now,
        )


def test_create_booking_rejects_when_room_already_booked_in_overlapping_range(
    service, available_room, student, now
):
    service.create_booking(
        room_id=available_room.id,
        user_id=student.id,
        start_at=now + timedelta(hours=1),
        end_at=now + timedelta(hours=3),
        now=now,
    )

    with pytest.raises(RoomNotAvailableError):
        service.create_booking(
            room_id=available_room.id,
            user_id=999,
            start_at=now + timedelta(hours=2),
            end_at=now + timedelta(hours=4),
            now=now,
        )


def test_create_booking_rejects_4th_active_booking_for_same_user(
    service, available_room, student, now
):
    for i in range(3):
        service.create_booking(
            room_id=available_room.id,
            user_id=student.id,
            start_at=now + timedelta(days=i, hours=1),
            end_at=now + timedelta(days=i, hours=2),
            now=now,
        )

    with pytest.raises(ActiveBookingLimitError):
        service.create_booking(
            room_id=available_room.id,
            user_id=student.id,
            start_at=now + timedelta(days=10, hours=1),
            end_at=now + timedelta(days=10, hours=2),
            now=now,
        )


def test_create_booking_succeeds_again_after_cancelling_one_of_three(
    service, available_room, student, now
):
    bookings = [
        service.create_booking(
            room_id=available_room.id,
            user_id=student.id,
            start_at=now + timedelta(days=i, hours=1),
            end_at=now + timedelta(days=i, hours=2),
            now=now,
        )
        for i in range(3)
    ]

    service.cancel_booking(booking_id=bookings[0].id, user_id=student.id, now=now)

    fourth = service.create_booking(
        room_id=available_room.id,
        user_id=student.id,
        start_at=now + timedelta(days=10, hours=1),
        end_at=now + timedelta(days=10, hours=2),
        now=now,
    )
    assert fourth.status == "confirmed"


def test_cancel_booking_marks_status_cancelled_when_owner_cancels_in_time(
    service, available_room, student, now
):
    booking = service.create_booking(
        room_id=available_room.id,
        user_id=student.id,
        start_at=now + timedelta(hours=2),
        end_at=now + timedelta(hours=3),
        now=now,
    )

    cancelled = service.cancel_booking(booking_id=booking.id, user_id=student.id, now=now)

    assert cancelled.status == "cancelled"


def test_cancel_booking_rejects_when_not_the_owner(service, available_room, student, now):
    booking = service.create_booking(
        room_id=available_room.id,
        user_id=student.id,
        start_at=now + timedelta(hours=2),
        end_at=now + timedelta(hours=3),
        now=now,
    )

    with pytest.raises(ForbiddenError):
        service.cancel_booking(booking_id=booking.id, user_id=999, now=now)


def test_cancel_booking_rejects_unknown_booking_id(service, student, now):
    with pytest.raises(BookingNotFoundError):
        service.cancel_booking(booking_id=9999, user_id=student.id, now=now)


def test_cancel_booking_rejects_within_1_hour_of_start(service, available_room, student, now):
    booking = service.create_booking(
        room_id=available_room.id,
        user_id=student.id,
        start_at=now + timedelta(minutes=30),
        end_at=now + timedelta(hours=1),
        now=now,
    )

    with pytest.raises(CancellationWindowPassedError):
        service.cancel_booking(booking_id=booking.id, user_id=student.id, now=now)
