from repositories import InMemoryBookingRepository


class FakeBookingRepo(InMemoryBookingRepository):
    """Test double for BookingRepository — see FakeRoomRepo for why this
    subclasses the in-memory implementation instead of reimplementing it."""
