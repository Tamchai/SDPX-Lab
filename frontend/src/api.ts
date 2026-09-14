const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = body?.error?.message ?? body?.detail ?? 'Request failed'
    const code = body?.error?.code ?? 'UNKNOWN_ERROR'
    throw new ApiError(message, code, response.status)
  }

  return body as T
}

export interface User {
  id: number
  email: string
  fullName: string
}

export interface Room {
  id: number
  name: string
  building: string
  capacity: number
}

export interface Booking {
  id: number
  roomId: number
  userId: number
  startAt: string
  endAt: string
  status: 'confirmed' | 'cancelled'
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function listRooms(token: string) {
  return request<Room[]>('/rooms', {}, token)
}

export function createBooking(
  token: string,
  input: { roomId: number; startAt: string; endAt: string },
) {
  return request<Booking>(
    '/bookings',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  )
}

export function listMyBookings(token: string) {
  return request<Booking[]>('/bookings/me', {}, token)
}

export function cancelBooking(token: string, bookingId: number) {
  return request<void>(`/bookings/${bookingId}`, { method: 'DELETE' }, token)
}
