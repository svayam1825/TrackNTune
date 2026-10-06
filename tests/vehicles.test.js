const request = require('supertest');
const app = require('../server');

describe('Vehicle Management & Status Calculation API', () => {
  let createdVehicleId = null;

  test('GET /api/vehicles should return a list of vehicles with status attached', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('status');
      expect(typeof res.body[0].status).toBe('string');
    }
  });

  test('POST /api/vehicles should reject vehicle without a name', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({ type: 'car' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/name is required/i);
  });

  test('POST /api/vehicles should create a new vehicle', async () => {
    const newVehicle = {
      name: 'Test Roadster',
      type: 'car',
      make: 'Tesla',
      model: 'Roadster',
      year: 2024,
      currentOdometer: 5000,
      defaultIntervalKm: 10000,
      defaultIntervalMonths: 12
    };

    const res = await request(app)
      .post('/api/vehicles')
      .send(newVehicle);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(newVehicle.name);
    createdVehicleId = res.body._id;
  });

  test('GET /api/vehicles/:id should return details of specific vehicle', async () => {
    if (!createdVehicleId) return;
    const res = await request(app).get(`/api/vehicles/${createdVehicleId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(createdVehicleId);
    expect(res.body).toHaveProperty('services');
    expect(res.body).toHaveProperty('fuelLogs');
  });

  test('DELETE /api/vehicles/:id should delete created vehicle', async () => {
    if (!createdVehicleId) return;
    const res = await request(app).delete(`/api/vehicles/${createdVehicleId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
