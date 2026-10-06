const request = require('supertest');
const app = require('../server');

describe('Authentication & User API Routes', () => {
  const testUser = {
    name: 'Test Driver',
    email: `testdriver_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    role: 'personal'
  };

  test('POST /api/auth/register should create a new user and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('POST /api/auth/register should fail on duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/login should authenticate user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.name).toBe(testUser.name);
  });

  test('POST /api/auth/login should fail on incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });
});
