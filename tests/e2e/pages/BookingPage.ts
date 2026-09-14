import type { Page, Locator } from '@playwright/test'

export class BookingPage {
  readonly roomList: Locator
  readonly dateInput: Locator
  readonly startTimeInput: Locator
  readonly endTimeInput: Locator
  readonly submitButton: Locator
  readonly successMessage: Locator
  readonly errorMessage: Locator
  readonly myBookings: Locator

  constructor(private readonly page: Page) {
    this.roomList = page.getByTestId('room-list')
    this.dateInput = page.getByLabel('Date')
    this.startTimeInput = page.getByLabel('Start time')
    this.endTimeInput = page.getByLabel('End time')
    this.submitButton = page.getByTestId('submit-booking')
    this.successMessage = page.getByTestId('success-msg')
    this.errorMessage = page.getByTestId('error-msg')
    this.myBookings = page.getByTestId('my-bookings')
  }

  async selectRoom(roomName: string) {
    await this.roomList
      .getByRole('heading', { name: roomName })
      .locator('..')
      .getByRole('button', { name: /select room|selected/i })
      .click()
  }

  async fillSlot(date: string, startTime: string, endTime: string) {
    await this.dateInput.fill(date)
    await this.startTimeInput.fill(startTime)
    await this.endTimeInput.fill(endTime)
  }

  async submit() {
    await this.submitButton.click()
  }

  async cancelBookingFor(roomName: string) {
    await this.myBookings
      .getByRole('listitem')
      .filter({ hasText: roomName })
      .getByRole('button', { name: 'Cancel' })
      .click()
  }
}
