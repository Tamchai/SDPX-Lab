import type { Booking, Room } from '../api'

interface Props {
  bookings: Booking[]
  rooms: Room[]
  onCancel: (bookingId: number) => void
}

export function MyBookings({ bookings, rooms, onCancel }: Props) {
  const active = bookings.filter((b) => b.status === 'confirmed')

  return (
    <div data-testid="my-bookings">
      {active.length === 0 ? (
        <p className="text-sm text-slate-500">You have no upcoming bookings yet.</p>
      ) : (
        <ul className="space-y-3">
          {active.map((booking) => {
            const room = rooms.find((r) => r.id === booking.roomId)
            return (
              <li
                key={booking.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {room?.name ?? `Room #${booking.roomId}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(booking.startAt).toLocaleString()} –{' '}
                    {new Date(booking.endAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCancel(booking.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                >
                  Cancel
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
