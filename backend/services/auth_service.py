from __future__ import annotations

import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt

from errors import InvalidCredentialsError, InvalidTokenError
from models import User
from repositories import UserRepository

JWT_SECRET = os.environ.get("SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
TOKEN_TTL = timedelta(hours=8)
_PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    salt_hex, _, digest_hex = password_hash.partition("$")
    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(digest_hex)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return hmac.compare_digest(expected, actual)


class AuthService:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    def login(self, *, email: str, password: str) -> tuple[str, User]:
        user = self._user_repo.find_by_email(email)
        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError("invalid email or password")

        token = self._issue_token(user)
        return token, user

    def _issue_token(self, user: User) -> str:
        payload = {
            "sub": str(user.id),
            "exp": datetime.now(timezone.utc) + TOKEN_TTL,
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def user_from_token(self, token: str) -> User:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.PyJWTError as exc:
            raise InvalidTokenError("invalid or expired token") from exc

        user = self._user_repo.find_by_id(int(payload["sub"]))
        if user is None:
            raise InvalidTokenError("invalid or expired token")
        return user
