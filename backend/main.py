from __future__ import annotations

import os
from datetime import datetime

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

from errors import DomainError, InvalidTokenError
from models import Room, User
from repositories import InMemoryBookingRepository, InMemoryRoomRepository, InMemoryUserRepository
from seed import cleanup as seed_cleanup
from seed import seed as seed_data
from services.auth_service import AuthService
from services.booking_service import BookingService

app = FastAPI(title="Room Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)

room_repo = InMemoryRoomRepository()
user_repo = InMemoryUserRepository()
booking_repo = InMemoryBookingRepository()
seed_data(room_repo, user_repo, booking_repo)

auth_service = AuthService(user_repo)
booking_service = BookingService(room_repo, booking_repo)


@app.exception_handler(DomainError)
def handle_domain_error(_request, exc: DomainError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


def get_current_user(authorization: str | None = Header(default=None)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        return auth_service.user_from_token(token)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


# ---------- schemas ----------


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: int
    email: str
    fullName: str


class LoginResponse(BaseModel):
    token: str
    user: UserOut


class RoomOut(BaseModel):
    id: int
    name: str
    building: str
    capacity: int


class CreateBookingRequest(BaseModel):
    roomId: int
    startAt: datetime
    endAt: datetime


class BookingOut(BaseModel):
    id: int
    roomId: int
    userId: int
    startAt: datetime
    endAt: datetime
    status: str


def _room_out(room: Room) -> RoomOut:
    return RoomOut(id=room.id, name=room.name, building=room.building, capacity=room.capacity)


def _booking_out(booking) -> BookingOut:  # noqa: ANN001
    return BookingOut(
        id=booking.id,
        roomId=booking.room_id,
        userId=booking.user_id,
        startAt=booking.start_at,
        endAt=booking.end_at,
        status=booking.status,
    )


# ---------- routes ----------


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    token, user = auth_service.login(email=payload.email, password=payload.password)
    return LoginResponse(
        token=token, user=UserOut(id=user.id, email=user.email, fullName=user.full_name)
    )


@app.get("/api/rooms", response_model=list[RoomOut])
def list_rooms(_user: User = Depends(get_current_user)) -> list[RoomOut]:
    return [_room_out(r) for r in room_repo.list_active()]


@app.post("/api/bookings", response_model=BookingOut, status_code=201)
def create_booking(
    payload: CreateBookingRequest, user: User = Depends(get_current_user)
) -> BookingOut:
    booking = booking_service.create_booking(
        room_id=payload.roomId,
        user_id=user.id,
        start_at=payload.startAt,
        end_at=payload.endAt,
    )
    return _booking_out(booking)


@app.get("/api/bookings/me", response_model=list[BookingOut])
def list_my_bookings(user: User = Depends(get_current_user)) -> list[BookingOut]:
    return [_booking_out(b) for b in booking_service.list_my_bookings(user_id=user.id)]


@app.delete("/api/bookings/{booking_id}", status_code=204, response_model=None)
def cancel_booking(booking_id: int, user: User = Depends(get_current_user)) -> None:
    booking_service.cancel_booking(booking_id=booking_id, user_id=user.id)


# ---------- test-only endpoints (disabled in production) ----------


def _guard_test_endpoint() -> None:
    if os.environ.get("ENV", "development") == "production":
        raise HTTPException(status_code=404, detail="not found")


@app.post("/api/test/seed", status_code=204, response_model=None)
def test_seed() -> None:
    _guard_test_endpoint()
    seed_data(room_repo, user_repo, booking_repo)


@app.post("/api/test/cleanup", status_code=204, response_model=None)
def test_cleanup() -> None:
    _guard_test_endpoint()
    seed_cleanup(booking_repo)
