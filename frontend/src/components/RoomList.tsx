import type { Room } from '../api'

interface Props {
  rooms: Room[]
  selectedRoomId: number | null
  onSelect: (roomId: number) => void
}

export function RoomList({ rooms, selectedRoomId, onSelect }: Props) {
  return (
    <div data-testid="room-list" className="grid gap-4 md:grid-cols-3">
      {rooms.map((room) => (
        <article
          key={room.id}
          className="room-card rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {room.building}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              {room.capacity} seats
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{room.name}</h3>
          <button
            type="button"
            onClick={() => onSelect(room.id)}
            aria-pressed={selectedRoomId === room.id}
            className={`mt-6 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              selectedRoomId === room.id
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700'
            }`}
          >
            {selectedRoomId === room.id ? 'Selected' : 'Select room'}
          </button>
        </article>
      ))}
    </div>
  )
}
