from repositories import InMemoryRoomRepository


class FakeRoomRepo(InMemoryRoomRepository):
    """Test double for RoomRepository.

    Subclasses the in-memory implementation directly so the fake can never
    drift from the real interface — today the "real" repository is also
    in-memory (see memory-bank/units/booking/unit-brief.md tech-debt note on
    persistence), so this is a thin, explicit alias rather than a parallel
    reimplementation.
    """
