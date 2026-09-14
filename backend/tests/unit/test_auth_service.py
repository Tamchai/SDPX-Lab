import jwt
import pytest

from errors import InvalidCredentialsError, InvalidTokenError
from repositories import InMemoryUserRepository
from services.auth_service import AuthService


@pytest.fixture
def user_repo(student):
    return InMemoryUserRepository([student])


@pytest.fixture
def service(user_repo):
    return AuthService(user_repo)


def test_login_returns_token_and_user_for_correct_credentials(service, student):
    token, user = service.login(email=student.email, password="password123")

    assert token
    assert user.id == student.id


def test_login_rejects_wrong_password(service, student):
    with pytest.raises(InvalidCredentialsError):
        service.login(email=student.email, password="wrong-password")


def test_login_rejects_unknown_email(service):
    with pytest.raises(InvalidCredentialsError):
        service.login(email="nobody@test.com", password="password123")


def test_user_from_token_returns_matching_user_for_valid_token(service, student):
    token, _ = service.login(email=student.email, password="password123")

    user = service.user_from_token(token)

    assert user.id == student.id


def test_user_from_token_rejects_tampered_signature(service, student):
    token, _ = service.login(email=student.email, password="password123")
    header, payload, signature = token.split(".")
    tampered = f"{header}.{payload}.{signature[::-1]}"

    with pytest.raises(InvalidTokenError):
        service.user_from_token(tampered)


def test_user_from_token_rejects_token_signed_with_wrong_secret(service):
    forged = jwt.encode({"sub": "1"}, "not-the-real-secret", algorithm="HS256")

    with pytest.raises(InvalidTokenError):
        service.user_from_token(forged)
