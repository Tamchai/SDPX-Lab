from datetime import datetime, timezone

import pytest

from tests.factories import make_room, make_user
from tests.fakes.fake_booking_repo import FakeBookingRepo
from tests.fakes.fake_room_repo import FakeRoomRepo


@pytest.fixture
def now() -> datetime:
    return datetime(2026, 1, 15, 12, 0, tzinfo=timezone.utc)


@pytest.fixture
def available_room():
    return make_room(is_active=True)


@pytest.fixture
def inactive_room():
    return make_room(id=2, is_active=False)


@pytest.fixture
def student():
    return make_user()


@pytest.fixture
def room_repo(available_room):
    return FakeRoomRepo([available_room])


@pytest.fixture
def booking_repo():
    return FakeBookingRepo()
