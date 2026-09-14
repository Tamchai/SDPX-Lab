import { useState } from 'react'
import type { FormEvent } from 'react'

interface Props {
  roomName: string
  onSubmit: (input: { date: string; startTime: string; endTime: string }) => void
  successMessage: string | null
  errorMessage: string | null
}

export function BookingForm({ roomName, onSubmit, successMessage, errorMessage }: Props) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({ date, startTime, endTime })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Book {roomName}</h2>

      <form className="mt-4 grid gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">
            End time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            data-testid="submit-booking"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Book now
          </button>
        </div>
      </form>

      {successMessage && (
        <p data-testid="success-msg" className="mt-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p data-testid="error-msg" className="mt-4 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </section>
  )
}
