// Mirrors backend/seed.py — kept here so tests read known values instead of
// guessing what the backend seeded (see fixtures/index.ts for the actual
// POST /api/test/seed call that resets the backend to this state).
export const testData = {
  rooms: [
    { id: 1, name: 'A101', building: 'อาคาร A', capacity: 10 },
    { id: 2, name: 'A102', building: 'อาคาร A', capacity: 20 },
    { id: 3, name: 'B201', building: 'อาคาร B', capacity: 6 },
  ],
  student: {
    email: 'student@test.com',
    password: 'password123',
  },
}
