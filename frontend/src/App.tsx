import './App.css'

const rooms = [
  { name: 'Lecture Hall A', capacity: '120 seats', status: 'Available today' },
  { name: 'Innovation Lab', capacity: '24 seats', status: 'Booked for 2:00 PM' },
  { name: 'Meeting Room 3', capacity: '10 seats', status: 'Open this afternoon' },
]

function App() {
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

          <button
            type="button"
            data-testid="main-cta"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Book a room
          </button>
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
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-100"
              >
                View rooms
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Learn more
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 shadow-inner backdrop-blur-sm">
            <p className="text-sm font-medium text-indigo-50">Quick availability</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Next slot</p>
                <p className="mt-2 text-2xl font-semibold">09:00 AM</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Rooms open</p>
                <p className="mt-2 text-2xl font-semibold">18</p>
              </div>
            </div>
          </div>
        </section>

        <section id="rooms" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Available spaces</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Room list</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              Today
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.name}
                className="room-card rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Available
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {room.capacity}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{room.name}</h3>
                <p className="mt-3 text-sm text-slate-600">{room.status}</p>
                <button
                  type="button"
                  className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  Select room
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
