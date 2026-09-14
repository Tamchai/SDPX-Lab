import { useEffect, useState } from 'react'
import './App.css'
import {
  ApiError,
  cancelBooking,
  createBooking,
  listMyBookings,
  listRooms,
  login as apiLogin,
} from './api'
import type { Booking, Room, User } from './api'
import { LoginForm } from './components/LoginForm'
import { RoomList } from './components/RoomList'
import { BookingForm } from './components/BookingForm'
import { MyBookings } from './components/MyBookings'

const TOKEN_KEY = 'roomBooking.token'

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [rooms, setRooms] = useState<Room[]>([])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    refreshRooms(token)
    refreshMyBookings(token)
  }, [token])

  async function refreshRooms(currentToken: string) {
    try {
      setRooms(await listRooms(currentToken))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) handleLogout()
    }
  }

  async function refreshMyBookings(currentToken: string) {
    try {
      setMyBookings(await listMyBookings(currentToken))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) handleLogout()
    }
  }

  async function handleLogin(email: string, password: string) {
    setLoginError(null)
    try {
      const { token: newToken, user: loggedInUser } = await apiLogin(email, password)
      localStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken)
      setUser(loggedInUser)
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Unable to log in right now.')
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setRooms([])
    setMyBookings([])
    setSelectedRoomId(null)
  }

  async function handleBook(input: { date: string; startTime: string; endTime: string }) {
    setBookingSuccess(null)
    setBookingError(null)
    if (!token || selectedRoomId === null) return

    try {
      await createBooking(token, {
        roomId: selectedRoomId,
        startAt: new Date(`${input.date}T${input.startTime}`).toISOString(),
        endAt: new Date(`${input.date}T${input.endTime}`).toISOString(),
      })
      setBookingSuccess('Booking confirmed!')
      await refreshMyBookings(token)
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : 'Unable to create booking right now.')
    }
  }

  async function handleCancel(bookingId: number) {
    if (!token) return
    setCancelError(null)
    try {
      await cancelBooking(token, bookingId)
      await refreshMyBookings(token)
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : 'Unable to cancel booking right now.')
    }
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <nav
          data-testid="main-nav"
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
              R
            </div>
            <span className="text-lg font-semibold text-slate-900">Room Booking</span>
          </div>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#rooms" className="transition hover:text-slate-900">
              Browse rooms
            </a>
            <a href="#about" className="transition hover:text-slate-900">
              About
            </a>
            <a href="#support" className="transition hover:text-slate-900">
              Support
            </a>
          </div>

          {token ? (
            <div className="flex items-center gap-3">
              {user && <span className="text-sm text-slate-600">{user.fullName}</span>}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
              >
                Log out
              </button>
            </div>
          ) : (
            <a
              href="#login"
              data-testid="main-cta"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Book a room
            </a>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-12 grid gap-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 px-8 py-10 text-white shadow-xl md:grid-cols-[1.4fr_0.6fr] md:px-10">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-indigo-50">
              University booking
            </p>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
              Reserve the perfect space for your next class or meeting.
            </h1>
            <p className="mt-4 max-w-lg text-base text-indigo-50/90 md:text-lg">
              Explore available classrooms, labs, and collaboration rooms across campus in a few quick steps.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 shadow-inner backdrop-blur-sm">
            <p className="text-sm font-medium text-indigo-50">Quick availability</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Rooms open</p>
                <p className="mt-2 text-2xl font-semibold">{rooms.length || '—'}</p>
              </div>
            </div>
          </div>
        </section>

        {!token && (
          <div id="login">
            <LoginForm onSubmit={handleLogin} error={loginError} />
          </div>
        )}

        {token && (
          <div className="space-y-8">
            <section id="rooms" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Available spaces</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Room list</h2>
                </div>
              </div>
              <RoomList rooms={rooms} selectedRoomId={selectedRoomId} onSelect={setSelectedRoomId} />
            </section>

            {selectedRoom && (
              <BookingForm
                roomName={selectedRoom.name}
                onSubmit={handleBook}
                successMessage={bookingSuccess}
                errorMessage={bookingError}
              />
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">My bookings</h2>
              {cancelError && (
                <p data-testid="error-msg" className="mt-2 text-sm font-medium text-red-600">
                  {cancelError}
                </p>
              )}
              <div className="mt-4">
                <MyBookings bookings={myBookings} rooms={rooms} onCancel={handleCancel} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
