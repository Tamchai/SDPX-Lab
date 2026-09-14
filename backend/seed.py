from __future__ import annotations

from models import Room, User
from repositories import InMemoryBookingRepository, InMemoryRoomRepository, InMemoryUserRepository
from services.auth_service import hash_password

SEED_ROOMS = [
    Room(id=1, name="A101", building="อาคาร A", capacity=10),
    Room(id=2, name="A102", building="อาคาร A", capacity=20),
    Room(id=3, name="B201", building="อาคาร B", capacity=6),
]

# Fixed credential for local dev / E2E tests: student@test.com / password123
SEED_USERS = [
    User(
        id=1,
        email="student@test.com",
        password_hash=hash_password("password123"),
        full_name="Test Student",
    ),
]


def seed(
    room_repo: InMemoryRoomRepository,
    user_repo: InMemoryUserRepository,
    booking_repo: InMemoryBookingRepository,
) -> None:
    room_repo.replace_all([Room(**vars(r)) for r in SEED_ROOMS])
    user_repo.replace_all(list(SEED_USERS))
    booking_repo.clear()


def cleanup(booking_repo: InMemoryBookingRepository) -> None:
    booking_repo.clear()
