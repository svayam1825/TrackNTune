const request = require('supertest');
const app = require('../server');

describe('Garage Business Records & Inventory API', () => {
  let createdRecordId = null;
  let createdItemId = null;
  const businessName = 'Apex Moto & Auto Tuning Garage';

  test('GET /api/garage/records should return job cards for business', async () => {
    const res = await request(app).get(`/api/garage/records?businessName=${encodeURIComponent(businessName)}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/garage/records should create a new job card', async () => {
    const newJob = {
      garageOwnerId: 'u_garage1',
      garageBusinessName: businessName,
      customerName: 'Test Customer',
      customerPhone: '+91 99999 88888',
      vehicleType: 'bike',
      vehicleName: 'Yamaha FZ FI',
      regNumber: 'MH12 FZ 5555',
      workDone: 'Oil Change & Chain Lube',
      partsCost: 450,
      laborCost: 200,
      totalAmount: 650,
      status: 'Completed'
    };

    const res = await request(app).post('/api/garage/records').send(newJob);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.customerName).toBe('Test Customer');
    createdRecordId = res.body._id;
  });

  test('GET /api/garage/inventory should return stock items', async () => {
    const res = await request(app).get(`/api/garage/inventory?businessName=${encodeURIComponent(businessName)}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/garage/inventory should add a new stock item', async () => {
    const newItem = {
      garageBusinessName: businessName,
      partName: 'Castrol POWER1 10W-40 1L',
      category: 'Fluids & Lubricants',
      quantity: 12,
      minStockLevel: 4,
      unitPrice: 480,
      costPrice: 370,
      supplier: 'Castrol Authorized'
    };

    const res = await request(app).post('/api/garage/inventory').send(newItem);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.partName).toBe(newItem.partName);
    createdItemId = res.body._id;
  });

  test('DELETE /api/garage/inventory/:id should remove stock item', async () => {
    if (!createdItemId) return;
    const res = await request(app).delete(`/api/garage/inventory/${createdItemId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('DELETE /api/garage/records/:id should remove job card', async () => {
    if (!createdRecordId) return;
    const res = await request(app).delete(`/api/garage/records/${createdRecordId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
