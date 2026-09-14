class DomainError(Exception):
    """Base class for business-rule violations. Carries an HTTP-shaped code."""

    code = "DOMAIN_ERROR"
    status_code = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class InvalidTimeRangeError(DomainError):
    code = "INVALID_TIME_RANGE"
    status_code = 400


class RoomNotFoundError(DomainError):
    code = "ROOM_NOT_FOUND"
    status_code = 404


class RoomNotAvailableError(DomainError):
    code = "ROOM_NOT_AVAILABLE"
    status_code = 409


class ActiveBookingLimitError(DomainError):
    code = "ACTIVE_BOOKING_LIMIT_REACHED"
    status_code = 409


class BookingNotFoundError(DomainError):
    code = "BOOKING_NOT_FOUND"
    status_code = 404


class ForbiddenError(DomainError):
    code = "FORBIDDEN"
    status_code = 403


class CancellationWindowPassedError(DomainError):
    code = "CANCELLATION_WINDOW_PASSED"
    status_code = 409


class InvalidCredentialsError(DomainError):
    code = "INVALID_CREDENTIALS"
    status_code = 401


class InvalidTokenError(DomainError):
    code = "INVALID_TOKEN"
    status_code = 401
