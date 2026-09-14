import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { BookingPage } from '../pages/BookingPage'
import { testData } from '../seed/test-data'

// The date/time <input> fields — and the app's `new Date(\`${date}T${time}\`)`
// parsing of them — work in the browser's *local* time, not UTC, so these
// helpers build local-time strings rather than slicing an ISO/UTC string.
function toLocalDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toLocalTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

function tomorrow(): string {
  return toLocalDateInput(new Date(Date.now() + 86_400_000))
}

async function loginAsStudent(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(testData.student.email, testData.student.password)
  await expect(page.getByTestId('room-list')).toBeVisible()
}

test.describe('Booking a room', () => {
  // AC (US-3): Given a room is free for the whole requested time range,
  // when I submit a valid booking, then it is created as confirmed.
  test('happy path: booking succeeds for an available slot', async ({ page }) => {
    await loginAsStudent(page)
    const bookingPage = new BookingPage(page)

    await bookingPage.selectRoom('A101')
    await bookingPage.fillSlot(tomorrow(), '13:00', '15:00')
    await bookingPage.submit()

    await expect(bookingPage.successMessage).toBeVisible()
    await expect(bookingPage.myBookings).toContainText('A101')
  })

  // AC (US-6): Given a room already has a confirmed booking for a time
  // range, when another booking is submitted for an overlapping range,
  // then it is rejected and no new booking is created.
  test('edge case: double-booking the same slot is rejected', async ({ page }) => {
    await loginAsStudent(page)
    const bookingPage = new BookingPage(page)
    const date = tomorrow()

    await bookingPage.selectRoom('A102')
    await bookingPage.fillSlot(date, '10:00', '11:00')
    await bookingPage.submit()
    await expect(bookingPage.successMessage).toBeVisible()

    await bookingPage.selectRoom('A102')
    await bookingPage.fillSlot(date, '10:30', '11:30')
    await bookingPage.submit()

    await expect(bookingPage.errorMessage).toContainText('not available')
  })

  // AC (US-5): Given I own a confirmed future booking, when I cancel it,
  // then it disappears from my active bookings.
  test('happy path: cancelling a booking removes it from the active list', async ({ page }) => {
    await loginAsStudent(page)
    const bookingPage = new BookingPage(page)

    await bookingPage.selectRoom('B201')
    await bookingPage.fillSlot(tomorrow(), '09:00', '10:00')
    await bookingPage.submit()
    await expect(bookingPage.myBookings).toContainText('B201')

    await bookingPage.cancelBookingFor('B201')

    await expect(bookingPage.myBookings).not.toContainText('B201')
  })

  // AC (US-9): Given a confirmed booking starting in less than 1 hour,
  // when I try to cancel it, then it is rejected and stays confirmed.
  test('edge case: cancelling within 1 hour of start time is rejected', async ({ page }) => {
    await loginAsStudent(page)
    const bookingPage = new BookingPage(page)

    const startAt = new Date(Date.now() + 30 * 60_000)
    const endAt = new Date(startAt.getTime() + 30 * 60_000)
    const date = toLocalDateInput(startAt)
    const start = toLocalTimeInput(startAt)
    const end = toLocalTimeInput(endAt)

    await bookingPage.selectRoom('A101')
    await bookingPage.fillSlot(date, start, end)
    await bookingPage.submit()
    await expect(bookingPage.myBookings).toContainText('A101')

    await bookingPage.cancelBookingFor('A101')

    await expect(bookingPage.errorMessage).toContainText('1 hour')
    await expect(bookingPage.myBookings).toContainText('A101')
  })
})
