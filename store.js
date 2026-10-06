const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Vehicle = require('./models/Vehicle');
const Service = require('./models/Service');
const Fuel = require('./models/Fuel');
const User = require('./models/User');
const GarageRecord = require('./models/GarageRecord');
const InventoryItem = require('./models/InventoryItem');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Helper to generate unique IDs for local JSON store
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

const nowMs = Date.now();
const dayMs = 24 * 3600 * 1000;

// Default visual SVG images for fallback
const DEFAULT_IMAGES = {
  car_sedan: '/images/car_sedan.svg',
  car_suv: '/images/car_suv.svg',
  car_electric: '/images/car_electric.svg',
  car_hatchback: '/images/car_hatchback.svg',
  bike_cruiser: '/images/bike_cruiser.svg',
  bike_superbike: '/images/bike_superbike.svg',
  bike_scooter: '/images/bike_scooter.svg',
  bike_adventure: '/images/bike_adventure.svg'
};

// Initial seed data with rich realism including Honda Activa 125, Garage Owner accounts & records
const initialSeed = {
  users: [
    {
      _id: 'u_garage1',
      role: 'garage_owner',
      name: 'Rajesh Sharma',
      email: 'garage@apex.com',
      password: 'password123',
      businessName: 'Apex Moto & Auto Tuning Garage',
      phone: '+91 98765 43210',
      address: 'Plot 42, Auto Hub Estate, MG Road',
      specialization: 'Scooter & Bike Tyre Specialist, Multi-Brand Service & Engine Overhaul',
      city: 'Pune'
    },
    {
      _id: 'u_personal1',
      role: 'personal',
      name: 'Svayam',
      email: 'user@trackntune.com',
      password: 'password123'
    }
  ],
  vehicles: [
    {
      _id: 'v_activa125',
      type: 'bike',
      name: 'Honda Activa 125',
      make: 'Honda',
      model: 'Activa 125 FI',
      year: 2023,
      regNumber: 'MH12 AB 1250',
      fuelType: 'Petrol',
      currentOdometer: 14200,
      imageUrl: '/images/bike_scooter.svg',
      insuranceExpiry: new Date(nowMs + 120 * dayMs).toISOString(),
      pucExpiry: new Date(nowMs + 25 * dayMs).toISOString(),
      taxExpiry: new Date(nowMs + 360 * dayMs).toISOString(),
      defaultIntervalKm: 3000,
      defaultIntervalMonths: 6,
      notes: 'Daily urban scooter. 124cc PGM-FI engine, Combi Brake System (CBS).',
      createdAt: new Date(nowMs - 280 * dayMs).toISOString(),
      condition: {
        overallHealthScore: 82,
        overallStatus: 'Needs Attention (Rear Tyre Wear)',
        engineStatus: 'Good (Smooth Idling)',
        engineOilLevel: '75%',
        engineOilQuality: '100% Synthetic 10W-30 MB',
        frontTyreSize: '90/90-12',
        rearTyreSize: '90/100-10',
        frontTyreCondition: 'Good (MRF Zapper 90/90-12)',
        rearTyreCondition: 'Worn (Tread 1.5mm - Replace Soon)',
        frontTyrePressure: 24,
        rearTyrePressure: 29,
        tyreTreadDepth: 'Front: 3.8mm, Rear: 1.5mm',
        brakeCondition: 'Good (CBS Equalizer adjusted)',
        brakePadWear: '70% Remaining',
        batteryStatus: 'Good (12V 4Ah Maintenance Free)',
        chainOrTransmission: 'V-Belt inspected at 12k km',
        lastInspectionDate: new Date(nowMs - 10 * dayMs).toISOString(),
        inspectionNotes: 'Rear tyre tread reaching wear indicator. Engine oil healthy.'
      }
    },
    {
      _id: 'v_bmw3',
      type: 'car',
      name: 'BMW 3 Series M Sport',
      make: 'BMW',
      model: '330i',
      year: 2023,
      regNumber: 'MH12 AB 9999',
      fuelType: 'Petrol',
      currentOdometer: 18450,
      imageUrl: '/images/car_sedan.svg',
      insuranceExpiry: new Date(nowMs + 45 * dayMs).toISOString(),
      pucExpiry: new Date(nowMs + 10 * dayMs).toISOString(),
      taxExpiry: new Date(nowMs + 240 * dayMs).toISOString(),
      defaultIntervalKm: 5000,
      defaultIntervalMonths: 6,
      notes: 'Executive daily driver. High performance twin-scroll turbo engine.',
      createdAt: new Date(nowMs - 365 * dayMs).toISOString(),
      condition: {
        overallHealthScore: 94,
        overallStatus: 'Excellent',
        engineStatus: 'Excellent',
        engineOilLevel: '100%',
        engineOilQuality: '5W-30 Synthetic',
        frontTyreSize: '225/45 R18',
        rearTyreSize: '255/40 R18',
        frontTyreCondition: 'Good',
        rearTyreCondition: 'Good',
        frontTyrePressure: 32,
        rearTyrePressure: 35,
        tyreTreadDepth: '5.2 mm',
        brakeCondition: 'Good',
        brakePadWear: '85% Remaining',
        batteryStatus: '12.8V Healthy',
        chainOrTransmission: 'Automatic 8-Speed Steptronic',
        lastInspectionDate: new Date(nowMs - 15 * dayMs).toISOString(),
        inspectionNotes: 'Full synthetic oil flush completed recently.'
      }
    },
    {
      _id: 'v_re650',
      type: 'bike',
      name: 'Royal Enfield Interceptor 650',
      make: 'Royal Enfield',
      model: 'Interceptor 650',
      year: 2022,
      regNumber: 'KA05 XY 6500',
      fuelType: 'Petrol',
      currentOdometer: 12300,
      imageUrl: '/images/bike_cruiser.svg',
      insuranceExpiry: new Date(nowMs - 5 * dayMs).toISOString(),
      pucExpiry: new Date(nowMs + 75 * dayMs).toISOString(),
      taxExpiry: new Date(nowMs + 180 * dayMs).toISOString(),
      defaultIntervalKm: 4000,
      defaultIntervalMonths: 6,
      notes: 'Parallel-twin 648cc retro roadster. Pure motorcycle bliss.',
      createdAt: new Date(nowMs - 400 * dayMs).toISOString(),
      condition: {
        overallHealthScore: 88,
        overallStatus: 'Good',
        engineStatus: 'Good',
        engineOilLevel: '80%',
        engineOilQuality: 'Motul 7100 10W-50',
        frontTyreSize: '100/90-18',
        rearTyreSize: '130/70-18',
        frontTyreCondition: 'Good (Ceat Zoom Cruz)',
        rearTyreCondition: 'Good',
        frontTyrePressure: 32,
        rearTyrePressure: 39,
        tyreTreadDepth: '4.0 mm',
        brakeCondition: 'Good (ByBre Calipers)',
        brakePadWear: '75% Remaining',
        batteryStatus: '12.5V Good',
        chainOrTransmission: 'Cleaned & Motul Lube Applied',
        lastInspectionDate: new Date(nowMs - 20 * dayMs).toISOString(),
        inspectionNotes: 'Chain slack tension adjusted to 25mm.'
      }
    }
  ],
  services: [
    {
      _id: 's_activa1',
      vehicle: 'v_activa125',
      date: new Date(nowMs - 35 * dayMs).toISOString(),
      odometer: 13000,
      serviceType: '10W-30 Oil Swap & Transmission Check',
      category: 'Maintenance',
      cost: 1850,
      partsCost: 1250,
      laborCost: 600,
      garage: 'Apex Moto & Auto Tuning Garage',
      notes: 'Honda OEM 10W-30 MB oil replaced. Spark plug cleaned & gap set to 0.85mm.',
      intervalKm: 3000,
      intervalMonths: 6
    },
    {
      _id: 's1',
      vehicle: 'v_bmw3',
      date: new Date(nowMs - 60 * dayMs).toISOString(),
      odometer: 14500,
      serviceType: 'Oil Change & Synthetic Flush',
      category: 'Maintenance',
      cost: 14500,
      partsCost: 10500,
      laborCost: 4000,
      garage: 'BMW Authorised Service Center',
      notes: 'Replaced oil filter, air filter, and cabin microfilter with OEM parts.',
      intervalKm: 5000,
      intervalMonths: 6
    }
  ],
  fuelLogs: [
    {
      _id: 'f_activa1',
      vehicle: 'v_activa125',
      date: new Date(nowMs - 4 * dayMs).toISOString(),
      odometer: 14200,
      liters: 4.8,
      pricePerLiter: 104.2,
      totalCost: 500,
      fullTank: true,
      station: 'HP Petrol Pump',
      notes: 'Regular city commute fuel refill'
    }
  ],
  garageRecords: [
    {
      _id: 'grec_1',
      garageOwnerId: 'u_garage1',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      customerName: 'Anand Verma',
      customerPhone: '+91 98989 12345',
      vehicleType: 'bike',
      vehicleName: 'Honda Activa 125',
      regNumber: 'MH12 AB 1250',
      odometer: 14200,
      serviceDate: new Date(nowMs - 2 * dayMs).toISOString(),
      serviceCategory: 'Tyre Fitment & Maintenance',
      workDone: 'Fitted Rear Tyre MRF Zapper 90/100-10, Replaced 10W-30 Engine Oil & CBS Brake Adjustment',
      partsCost: 1950,
      laborCost: 400,
      totalAmount: 2350,
      vehicleCondition: 'Good (New Rear Tyre Fitted)',
      status: 'Completed',
      notes: 'Customer notified for next service in 3,000 km.'
    },
    {
      _id: 'grec_2',
      garageOwnerId: 'u_garage1',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      customerName: 'Karan Malhotra',
      customerPhone: '+91 97766 54321',
      vehicleType: 'bike',
      vehicleName: 'Royal Enfield Interceptor 650',
      regNumber: 'KA05 XY 6500',
      odometer: 12300,
      serviceDate: new Date(nowMs - 5 * dayMs).toISOString(),
      serviceCategory: 'Full Service & Synthetic Oil',
      workDone: 'Motul 7100 10W-50 Synthetic Oil (3.1L), OEM Oil Filter, Chain Clean & Lube',
      partsCost: 3200,
      laborCost: 800,
      totalAmount: 4000,
      vehicleCondition: 'Excellent',
      status: 'Completed',
      notes: 'Cleaned air filter and tuned throttle bodies.'
    },
    {
      _id: 'grec_3',
      garageOwnerId: 'u_garage1',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      customerName: 'Suresh Patil',
      customerPhone: '+91 98111 22334',
      vehicleType: 'car',
      vehicleName: 'Maruti Suzuki Swift VXi',
      regNumber: 'MH14 DT 4020',
      odometer: 42100,
      serviceDate: new Date(nowMs - 1 * dayMs).toISOString(),
      serviceCategory: 'General Repair & AC Service',
      workDone: 'Brake Pad Replacement, AC Gas Top-up & Wheel Alignment',
      partsCost: 2800,
      laborCost: 1200,
      totalAmount: 4000,
      vehicleCondition: 'Good',
      status: 'In Progress',
      notes: 'Car currently on ramp for final wheel balancing.'
    }
  ],
  inventoryItems: [
    {
      _id: 'inv_1',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      partName: '10W-30 Synthetic Scooter Oil (800ml)',
      category: 'Fluids & Lubricants',
      partNumber: 'OIL-10W30-800',
      quantity: 14,
      minStockLevel: 5,
      unitPrice: 380,
      costPrice: 290,
      supplier: 'Motul Authorized Distributor',
      notes: 'Standard 4T MB oil for Honda Activa & Jupiter.'
    },
    {
      _id: 'inv_2',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      partName: 'MRF Zapper 90/90-12 Tubeless Front Tyre',
      category: 'Tyres',
      partNumber: 'TYRE-9090-12',
      quantity: 3,
      minStockLevel: 5,
      unitPrice: 1450,
      costPrice: 1150,
      supplier: 'MRF Direct Wholesale',
      notes: 'Popular front tyre for scooters.'
    },
    {
      _id: 'inv_3',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      partName: 'MRF Nylogrip 90/100-10 Rear Tyre',
      category: 'Tyres',
      partNumber: 'TYRE-90100-10',
      quantity: 8,
      minStockLevel: 4,
      unitPrice: 1320,
      costPrice: 1020,
      supplier: 'MRF Direct Wholesale',
      notes: 'Rear tyre for 10-inch scooter wheels.'
    },
    {
      _id: 'inv_4',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      partName: 'Honda Activa Disc Brake Pads Set',
      category: 'Brakes',
      partNumber: 'BRK-ACT-01',
      quantity: 6,
      minStockLevel: 4,
      unitPrice: 450,
      costPrice: 310,
      supplier: 'Nissin Brake Components',
      notes: 'Front disc brake pad kit.'
    },
    {
      _id: 'inv_5',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      partName: 'NGK Spark Plug CPR8EA-9',
      category: 'Electrical',
      partNumber: 'SPK-CPR8EA',
      quantity: 2,
      minStockLevel: 5,
      unitPrice: 160,
      costPrice: 110,
      supplier: 'NGK Spark Plugs India',
      notes: 'Standard OEM spark plug.'
    },
    {
      _id: 'inv_6',
      garageBusinessName: 'Apex Moto & Auto Tuning Garage',
      partName: 'Bando Variator V-Belt Activa 125',
      category: 'Transmission',
      partNumber: 'BLT-ACT125',
      quantity: 4,
      minStockLevel: 5,
      unitPrice: 520,
      costPrice: 390,
      supplier: 'Bando Belts Dealer',
      notes: 'Drive belt replacement.'
    }
  ]
};

function readLocalDb() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data.vehicles || data.vehicles.length === 0) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    if (!data.users) data.users = initialSeed.users;
    if (!data.garageRecords) data.garageRecords = initialSeed.garageRecords;
    if (!data.inventoryItems) data.inventoryItems = initialSeed.inventoryItems;
    return data;
  } catch (err) {
    console.error('Error reading JSON DB, re-initializing seed:', err.message);
    return initialSeed;
  }
}

function writeLocalDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON DB:', err.message);
  }
}

function isMongo() {
  return mongoose.connection.readyState === 1;
}

// Attach status & expiry alerts for a vehicle object
async function attachStatus(vehicleObj) {
  const vId = vehicleObj._id ? String(vehicleObj._id) : String(vehicleObj.id);
  
  let services = [];
  let fuelLogs = [];

  if (isMongo()) {
    services = await Service.find({ vehicle: vId }).sort({ date: -1, odometer: -1 });
    fuelLogs = await Fuel.find({ vehicle: vId }).sort({ date: -1, odometer: -1 });
  } else {
    const db = readLocalDb();
    services = (db.services || []).filter((s) => String(s.vehicle) === vId).sort((a, b) => new Date(b.date) - new Date(a.date));
    fuelLogs = (db.fuelLogs || []).filter((f) => String(f.vehicle) === vId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const lastService = services.length > 0 ? services[0] : null;

  const intervalKm = (lastService && lastService.intervalKm) || vehicleObj.defaultIntervalKm || 5000;
  const intervalMonths = (lastService && lastService.intervalMonths) || vehicleObj.defaultIntervalMonths || 6;

  const baseOdometer = lastService ? lastService.odometer : 0;
  const baseDate = lastService ? new Date(lastService.date) : new Date(vehicleObj.createdAt || nowMs);

  const nextDueOdometer = baseOdometer + intervalKm;
  const nextDueDate = new Date(baseDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);

  const kmRemaining = nextDueOdometer - (vehicleObj.currentOdometer || 0);
  const daysRemaining = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));

  // Compute Expiry Statuses
  const checkExpiry = (expiryDate) => {
    if (!expiryDate) return { status: 'none', days: null };
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { status: 'overdue', days };
    if (days <= 15) return { status: 'due-soon', days };
    return { status: 'ok', days };
  };

  const insuranceInfo = checkExpiry(vehicleObj.insuranceExpiry);
  const pucInfo = checkExpiry(vehicleObj.pucExpiry);
  const taxInfo = checkExpiry(vehicleObj.taxExpiry);

  let serviceStatus = 'ok';
  if (kmRemaining <= 0 || daysRemaining <= 0) {
    serviceStatus = 'overdue';
  } else if (kmRemaining <= 500 || daysRemaining <= 14) {
    serviceStatus = 'due-soon';
  }

  const statuses = [serviceStatus, insuranceInfo.status, pucInfo.status, taxInfo.status];
  let overallStatus = 'ok';
  if (statuses.includes('overdue')) {
    overallStatus = 'overdue';
  } else if (statuses.includes('due-soon')) {
    overallStatus = 'due-soon';
  }

  const sortedFuel = [...fuelLogs].sort((a, b) => Number(a.odometer) - Number(b.odometer));
  let totalFuelKm = 0;
  let totalFuelLiters = 0;
  
  for (let i = 0; i < sortedFuel.length - 1; i++) {
    const current = sortedFuel[i];
    const next = sortedFuel[i + 1];
    if (current.fullTank && next.fullTank) {
      const dist = Number(next.odometer) - Number(current.odometer);
      if (dist > 0 && Number(next.liters) > 0) {
        totalFuelKm += dist;
        totalFuelLiters += Number(next.liters);
      }
    }
  }

  const avgKmPerLiter = totalFuelLiters > 0 ? (totalFuelKm / totalFuelLiters).toFixed(1) : null;
  const totalServiceSpend = services.reduce((sum, s) => sum + Number(s.cost || 0), 0);
  const totalFuelSpend = fuelLogs.reduce((sum, f) => sum + Number(f.totalCost || 0), 0);
  const totalOverallSpend = totalServiceSpend + totalFuelSpend;
  const currentOdometer = Number(vehicleObj.currentOdometer || 0);
  const costPerKm = currentOdometer > 0 ? (totalOverallSpend / currentOdometer).toFixed(2) : '0.00';

  let imageUrl = vehicleObj.imageUrl;
  if (!imageUrl) {
    imageUrl = vehicleObj.type === 'bike' ? DEFAULT_IMAGES.bike_cruiser : DEFAULT_IMAGES.car_sedan;
  }

  const plain = typeof vehicleObj.toObject === 'function' ? vehicleObj.toObject() : vehicleObj;

  // Default condition block if not present
  const condition = plain.condition || {
    overallHealthScore: 88,
    overallStatus: 'Good',
    engineStatus: 'Good',
    engineOilLevel: '80%',
    engineOilQuality: 'Normal',
    frontTyreSize: vehicleObj.type === 'bike' ? '90/90-12' : '205/55 R16',
    rearTyreSize: vehicleObj.type === 'bike' ? '90/100-10' : '205/55 R16',
    frontTyreCondition: 'Good',
    rearTyreCondition: 'Good',
    frontTyrePressure: vehicleObj.type === 'bike' ? 24 : 32,
    rearTyrePressure: vehicleObj.type === 'bike' ? 29 : 33,
    tyreTreadDepth: '4.0 mm',
    brakeCondition: 'Good',
    brakePadWear: '75% Remaining',
    batteryStatus: 'Good (12.6V)',
    chainOrTransmission: 'Good',
    lastInspectionDate: new Date().toISOString(),
    inspectionNotes: 'No major defects recorded.'
  };

  return {
    ...plain,
    imageUrl,
    condition,
    lastService,
    nextDueOdometer,
    nextDueDate,
    kmRemaining,
    daysRemaining,
    serviceStatus,
    insuranceInfo,
    pucInfo,
    taxInfo,
    status: overallStatus,
    avgKmPerLiter: avgKmPerLiter ? Number(avgKmPerLiter) : null,
    totalServiceSpend,
    totalFuelSpend,
    totalSpend: totalOverallSpend,
    costPerKm: Number(costPerKm),
    serviceCount: services.length,
    fuelLogCount: fuelLogs.length
  };
}

module.exports = {
  isMongo,
  generateId,
  attachStatus,

  // ----- USER AUTH & PROFILE -----
  async registerUser(userData) {
    const { name, email, password, role, businessName, phone, address, specialization, city } = userData;
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    if (isMongo()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) throw new Error('An account with this email already exists.');
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'personal',
        businessName: businessName || '',
        phone: phone || '',
        address: address || '',
        specialization: specialization || '',
        city: city || ''
      });
      return user;
    } else {
      const db = readLocalDb();
      db.users = db.users || [];
      const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) throw new Error('An account with this email already exists.');
      const newUser = {
        _id: generateId(),
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'personal',
        businessName: businessName || '',
        phone: phone || '',
        address: address || '',
        specialization: specialization || 'Multi-Brand Service & Maintenance',
        city: city || '',
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeLocalDb(db);
      return newUser;
    }
  },

  async loginUser(email, password) {
    if (!email || !password) throw new Error('Email and password are required.');
    const user = await this.findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.');
    }
    return user;
  },

  async findUserByEmail(email) {
    if (!email) return null;
    if (isMongo()) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      const db = readLocalDb();
      return (db.users || []).find((u) => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async findUserById(id) {
    if (!id) return null;
    if (isMongo()) {
      return await User.findById(id);
    } else {
      const db = readLocalDb();
      return (db.users || []).find((u) => String(u._id) === String(id)) || null;
    }
  },

  // ----- GARAGE OWNER RECORDS & BUSINESS -----
  async getGarageRecords(garageBusinessName) {
    if (isMongo()) {
      const filter = garageBusinessName ? { garageBusinessName } : {};
      return await GarageRecord.find(filter).sort({ serviceDate: -1, createdAt: -1 });
    } else {
      const db = readLocalDb();
      let records = db.garageRecords || [];
      if (garageBusinessName) {
        records = records.filter((r) => r.garageBusinessName === garageBusinessName);
      }
      return records.sort((a, b) => new Date(b.serviceDate || b.createdAt) - new Date(a.serviceDate || a.createdAt));
    }
  },

  async createGarageRecord(data) {
    if (!data.garageBusinessName || !data.customerName || !data.vehicleName || !data.workDone) {
      throw new Error('Business name, customer name, vehicle name, and work done are required.');
    }
    const totalAmount = Number(data.totalAmount || (Number(data.partsCost || 0) + Number(data.laborCost || 0)));

    if (isMongo()) {
      const rec = await GarageRecord.create({
        ...data,
        totalAmount
      });
      return rec;
    } else {
      const db = readLocalDb();
      db.garageRecords = db.garageRecords || [];
      const newRec = {
        _id: generateId(),
        garageOwnerId: data.garageOwnerId || 'u_garage1',
        garageBusinessName: data.garageBusinessName,
        customerName: data.customerName,
        customerPhone: data.customerPhone || '',
        vehicleType: data.vehicleType || 'bike',
        vehicleName: data.vehicleName,
        regNumber: data.regNumber || '',
        odometer: Number(data.odometer || 0),
        serviceDate: data.serviceDate ? new Date(data.serviceDate).toISOString() : new Date().toISOString(),
        serviceCategory: data.serviceCategory || 'General Service',
        workDone: data.workDone,
        partsCost: Number(data.partsCost || 0),
        laborCost: Number(data.laborCost || 0),
        totalAmount,
        vehicleCondition: data.vehicleCondition || 'Good',
        status: data.status || 'Completed',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      db.garageRecords.unshift(newRec);
      writeLocalDb(db);
      return newRec;
    }
  },

  async updateGarageRecord(id, data) {
    if (isMongo()) {
      return await GarageRecord.findByIdAndUpdate(id, data, { new: true });
    } else {
      const db = readLocalDb();
      const idx = (db.garageRecords || []).findIndex((r) => String(r._id) === String(id));
      if (idx === -1) return null;

      const updated = {
        ...db.garageRecords[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      db.garageRecords[idx] = updated;
      writeLocalDb(db);
      return updated;
    }
  },

  async deleteGarageRecord(id) {
    if (isMongo()) {
      return await GarageRecord.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const idx = (db.garageRecords || []).findIndex((r) => String(r._id) === String(id));
      if (idx === -1) return null;
      const deleted = db.garageRecords.splice(idx, 1)[0];
      writeLocalDb(db);
      return deleted;
    }
  },

  async getAllGarages() {
    if (isMongo()) {
      return await User.find({ role: 'garage_owner' }, '-password');
    } else {
      const db = readLocalDb();
      return (db.users || [])
        .filter((u) => u.role === 'garage_owner')
        .map(({ password, ...rest }) => rest);
    }
  },

  // ----- SPARE PARTS INVENTORY MANAGEMENT -----
  async getInventory(garageBusinessName) {
    if (isMongo()) {
      const filter = garageBusinessName ? { garageBusinessName } : {};
      return await InventoryItem.find(filter).sort({ category: 1, partName: 1 });
    } else {
      const db = readLocalDb();
      let items = db.inventoryItems || [];
      if (garageBusinessName) {
        items = items.filter((item) => item.garageBusinessName === garageBusinessName);
      }
      return items.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }
  },

  async createInventoryItem(data) {
    if (!data.garageBusinessName || !data.partName) {
      throw new Error('Garage business name and part name are required.');
    }
    if (isMongo()) {
      return await InventoryItem.create(data);
    } else {
      const db = readLocalDb();
      db.inventoryItems = db.inventoryItems || [];
      const newItem = {
        _id: generateId(),
        garageBusinessName: data.garageBusinessName,
        partName: data.partName,
        category: data.category || 'Fluids & Lubricants',
        partNumber: data.partNumber || '',
        quantity: Number(data.quantity || 0),
        minStockLevel: Number(data.minStockLevel || 5),
        unitPrice: Number(data.unitPrice || 0),
        costPrice: Number(data.costPrice || 0),
        supplier: data.supplier || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      db.inventoryItems.unshift(newItem);
      writeLocalDb(db);
      return newItem;
    }
  },

  async updateInventoryItem(id, data) {
    if (isMongo()) {
      return await InventoryItem.findByIdAndUpdate(id, data, { new: true });
    } else {
      const db = readLocalDb();
      const idx = (db.inventoryItems || []).findIndex((i) => String(i._id) === String(id));
      if (idx === -1) return null;

      const updated = {
        ...db.inventoryItems[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      db.inventoryItems[idx] = updated;
      writeLocalDb(db);
      return updated;
    }
  },

  async deleteInventoryItem(id) {
    if (isMongo()) {
      return await InventoryItem.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const idx = (db.inventoryItems || []).findIndex((i) => String(i._id) === String(id));
      if (idx === -1) return null;
      const deleted = db.inventoryItems.splice(idx, 1)[0];
      writeLocalDb(db);
      return deleted;
    }
  },

  // ----- VEHICLE CONDITION UPDATES -----
  async updateVehicleCondition(id, conditionData) {
    if (isMongo()) {
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) return null;
      vehicle.condition = {
        ...vehicle.condition,
        ...conditionData,
        lastInspectionDate: new Date()
      };
      await vehicle.save();
      return await attachStatus(vehicle);
    } else {
      const db = readLocalDb();
      const idx = (db.vehicles || []).findIndex((v) => String(v._id) === String(id));
      if (idx === -1) return null;

      db.vehicles[idx].condition = {
        ...(db.vehicles[idx].condition || {}),
        ...conditionData,
        lastInspectionDate: new Date().toISOString()
      };
      writeLocalDb(db);
      return await attachStatus(db.vehicles[idx]);
    }
  },

  // ----- VEHICLES CRUD -----
  async getVehicles(filter = {}) {
    let list = [];
    if (isMongo()) {
      const query = {};
      if (filter.type) query.type = filter.type;
      list = await Vehicle.find(query).sort({ createdAt: -1 });
    } else {
      const db = readLocalDb();
      list = db.vehicles || [];
      if (filter.type) {
        list = list.filter((v) => v.type === filter.type);
      }
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return await Promise.all(list.map((v) => attachStatus(v)));
  },

  async getVehicleById(id) {
    let raw = null;
    if (isMongo()) {
      raw = await Vehicle.findById(id);
    } else {
      const db = readLocalDb();
      raw = (db.vehicles || []).find((v) => String(v._id) === String(id)) || null;
    }

    if (!raw) return null;
    const withStatus = await attachStatus(raw);

    const services = await this.getServicesForVehicle(id);
    const fuelLogs = await this.getFuelLogsForVehicle(id);

    return {
      ...withStatus,
      services,
      fuelLogs
    };
  },

  async createVehicle(data) {
    if (isMongo()) {
      const created = await Vehicle.create(data);
      return await attachStatus(created);
    } else {
      const db = readLocalDb();
      const newV = {
        _id: generateId(),
        type: data.type || 'car',
        name: data.name,
        make: data.make || '',
        model: data.model || '',
        year: data.year ? Number(data.year) : null,
        regNumber: data.regNumber || '',
        fuelType: data.fuelType || 'Petrol',
        currentOdometer: Number(data.currentOdometer || 0),
        imageUrl: data.imageUrl || (data.type === 'bike' ? '/images/bike_cruiser.svg' : '/images/car_sedan.svg'),
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry).toISOString() : null,
        pucExpiry: data.pucExpiry ? new Date(data.pucExpiry).toISOString() : null,
        taxExpiry: data.taxExpiry ? new Date(data.taxExpiry).toISOString() : null,
        defaultIntervalKm: Number(data.defaultIntervalKm || 5000),
        defaultIntervalMonths: Number(data.defaultIntervalMonths || 6),
        notes: data.notes || '',
        condition: data.condition || {
          overallHealthScore: 90,
          overallStatus: 'Good',
          engineStatus: 'Good',
          engineOilLevel: '100%',
          engineOilQuality: 'Fresh',
          frontTyreSize: data.type === 'bike' ? '90/90-12' : '205/55 R16',
          rearTyreSize: data.type === 'bike' ? '90/100-10' : '205/55 R16',
          frontTyreCondition: 'Good',
          rearTyreCondition: 'Good',
          frontTyrePressure: data.type === 'bike' ? 24 : 32,
          rearTyrePressure: data.type === 'bike' ? 29 : 33,
          tyreTreadDepth: '4.5 mm',
          brakeCondition: 'Good',
          brakePadWear: '80% Remaining',
          batteryStatus: 'Good (12.6V)',
          chainOrTransmission: 'Good',
          lastInspectionDate: new Date().toISOString(),
          inspectionNotes: 'Initial inspection clean.'
        },
        createdAt: new Date().toISOString()
      };
      db.vehicles = db.vehicles || [];
      db.vehicles.unshift(newV);
      writeLocalDb(db);
      return await attachStatus(newV);
    }
  },

  async updateVehicle(id, data) {
    if (isMongo()) {
      const updated = await Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      return updated ? await attachStatus(updated) : null;
    } else {
      const db = readLocalDb();
      const idx = (db.vehicles || []).findIndex((v) => String(v._id) === String(id));
      if (idx === -1) return null;

      const updated = {
        ...db.vehicles[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      db.vehicles[idx] = updated;
      writeLocalDb(db);
      return await attachStatus(updated);
    }
  },

  async deleteVehicle(id) {
    if (isMongo()) {
      const v = await Vehicle.findByIdAndDelete(id);
      if (v) {
        await Service.deleteMany({ vehicle: id });
        await Fuel.deleteMany({ vehicle: id });
      }
      return v;
    } else {
      const db = readLocalDb();
      const idx = (db.vehicles || []).findIndex((v) => String(v._id) === String(id));
      if (idx === -1) return null;

      const deleted = db.vehicles.splice(idx, 1)[0];
      db.services = (db.services || []).filter((s) => String(s.vehicle) !== String(id));
      db.fuelLogs = (db.fuelLogs || []).filter((f) => String(f.vehicle) !== String(id));
      writeLocalDb(db);
      return deleted;
    }
  },

  // ----- SERVICES -----
  async getServicesForVehicle(vehicleId) {
    if (isMongo()) {
      return await Service.find({ vehicle: vehicleId }).sort({ date: -1, odometer: -1 });
    } else {
      const db = readLocalDb();
      return (db.services || [])
        .filter((s) => String(s.vehicle) === String(vehicleId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async getAllServices() {
    if (isMongo()) {
      return await Service.find().sort({ date: -1 });
    } else {
      const db = readLocalDb();
      return (db.services || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async createService(data) {
    if (isMongo()) {
      const s = await Service.create(data);
      const vehicle = await Vehicle.findById(data.vehicle);
      if (vehicle && Number(data.odometer) > vehicle.currentOdometer) {
        vehicle.currentOdometer = Number(data.odometer);
        await vehicle.save();
      }
      return s;
    } else {
      const db = readLocalDb();
      const newS = {
        _id: generateId(),
        vehicle: data.vehicle,
        date: new Date(data.date).toISOString(),
        odometer: Number(data.odometer),
        serviceType: data.serviceType,
        category: data.category || 'Maintenance',
        cost: Number(data.cost || 0),
        partsCost: Number(data.partsCost || 0),
        laborCost: Number(data.laborCost || 0),
        garage: data.garage || '',
        notes: data.notes || '',
        intervalKm: data.intervalKm ? Number(data.intervalKm) : null,
        intervalMonths: data.intervalMonths ? Number(data.intervalMonths) : null,
        createdAt: new Date().toISOString()
      };
      db.services = db.services || [];
      db.services.unshift(newS);

      const vIdx = (db.vehicles || []).findIndex((v) => String(v._id) === String(data.vehicle));
      if (vIdx !== -1 && newS.odometer > db.vehicles[vIdx].currentOdometer) {
        db.vehicles[vIdx].currentOdometer = newS.odometer;
      }

      writeLocalDb(db);
      return newS;
    }
  },

  async updateService(id, data) {
    if (isMongo()) {
      return await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } else {
      const db = readLocalDb();
      const idx = (db.services || []).findIndex((s) => String(s._id) === String(id));
      if (idx === -1) return null;

      const updated = {
        ...db.services[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      db.services[idx] = updated;
      writeLocalDb(db);
      return updated;
    }
  },

  async deleteService(id) {
    if (isMongo()) {
      return await Service.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const idx = (db.services || []).findIndex((s) => String(s._id) === String(id));
      if (idx === -1) return null;
      const deleted = db.services.splice(idx, 1)[0];
      writeLocalDb(db);
      return deleted;
    }
  },

  // ----- FUEL LOGS -----
  async getFuelLogsForVehicle(vehicleId) {
    if (isMongo()) {
      return await Fuel.find({ vehicle: vehicleId }).sort({ date: -1, odometer: -1 });
    } else {
      const db = readLocalDb();
      return (db.fuelLogs || [])
        .filter((f) => String(f.vehicle) === String(vehicleId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async getAllFuelLogs() {
    if (isMongo()) {
      return await Fuel.find().sort({ date: -1 });
    } else {
      const db = readLocalDb();
      return (db.fuelLogs || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async createFuelLog(data) {
    const liters = Number(data.liters);
    const price = Number(data.pricePerLiter);
    const totalCost = Number(data.totalCost || liters * price);

    if (isMongo()) {
      const f = await Fuel.create({
        ...data,
        liters,
        pricePerLiter: price,
        totalCost,
        fullTank: data.fullTank !== false
      });
      const vehicle = await Vehicle.findById(data.vehicle);
      if (vehicle && Number(data.odometer) > vehicle.currentOdometer) {
        vehicle.currentOdometer = Number(data.odometer);
        await vehicle.save();
      }
      return f;
    } else {
      const db = readLocalDb();
      const newF = {
        _id: generateId(),
        vehicle: data.vehicle,
        date: new Date(data.date).toISOString(),
        odometer: Number(data.odometer),
        liters,
        pricePerLiter: price,
        totalCost,
        fullTank: data.fullTank !== false,
        station: data.station || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      db.fuelLogs = db.fuelLogs || [];
      db.fuelLogs.unshift(newF);

      const vIdx = (db.vehicles || []).findIndex((v) => String(v._id) === String(data.vehicle));
      if (vIdx !== -1 && newF.odometer > db.vehicles[vIdx].currentOdometer) {
        db.vehicles[vIdx].currentOdometer = newF.odometer;
      }

      writeLocalDb(db);
      return newF;
    }
  },

  async deleteFuelLog(id) {
    if (isMongo()) {
      return await Fuel.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const idx = (db.fuelLogs || []).findIndex((f) => String(f._id) === String(id));
      if (idx === -1) return null;
      const deleted = db.fuelLogs.splice(idx, 1)[0];
      writeLocalDb(db);
      return deleted;
    }
  },

  // ----- ANALYTICS -----
  async getAnalytics(vehicleId) {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) return null;

    const services = vehicle.services || [];
    const fuelLogs = vehicle.fuelLogs || [];

    const categorySpend = {};
    services.forEach((s) => {
      const cat = s.category || 'Maintenance';
      categorySpend[cat] = (categorySpend[cat] || 0) + Number(s.cost || 0);
    });

    const totalFuelSpend = fuelLogs.reduce((sum, f) => sum + Number(f.totalCost || 0), 0);
    if (totalFuelSpend > 0) {
      categorySpend['Fuel'] = totalFuelSpend;
    }

    const sortedFuel = [...fuelLogs].sort((a, b) => Number(a.odometer) - Number(b.odometer));
    const efficiencyHistory = [];

    for (let i = 0; i < sortedFuel.length - 1; i++) {
      const current = sortedFuel[i];
      const next = sortedFuel[i + 1];
      if (current.fullTank && next.fullTank) {
        const dist = Number(next.odometer) - Number(current.odometer);
        if (dist > 0 && Number(next.liters) > 0) {
          const eff = (dist / Number(next.liters)).toFixed(2);
          efficiencyHistory.push({
            date: next.date,
            odometer: next.odometer,
            distance: dist,
            liters: next.liters,
            kmPerLiter: Number(eff)
          });
        }
      }
    }

    return {
      vehicleId,
      vehicleName: vehicle.name,
      totalSpend: vehicle.totalSpend,
      totalServiceSpend: vehicle.totalServiceSpend,
      totalFuelSpend: vehicle.totalFuelSpend,
      avgKmPerLiter: vehicle.avgKmPerLiter,
      categorySpend,
      efficiencyHistory
    };
  },

  // ----- AI MECHANIC KNOWLEDGE ENGINE -----
  async getAiChatResponse(prompt, vehicleId) {
    const query = prompt.toLowerCase();
    let selectedVehicle = null;
    if (vehicleId) {
      selectedVehicle = await this.getVehicleById(vehicleId);
    }

    // Check if user specifically asks about Honda Activa 125 or scooter tyres / specs
    if (query.includes('activa') || query.includes('scooty') || (selectedVehicle && selectedVehicle.name.toLowerCase().includes('activa'))) {
      if (query.includes('tyre') || query.includes('tire') || query.includes('fit') || query.includes('scooty')) {
          return `For a Honda Activa 125, the common stock sizes are 90/90-12 front and 90/100-10 rear. Check the tyre sidewall and your owner’s manual before ordering, since fitment can vary by model year. What model year is yours?`;
      }

      if (query.includes('part') || query.includes('detail') || query.includes('thing') || query.includes('spec') || query.includes('oil')) {
        return `The Activa 125 typically uses 10W-30 scooter oil. Oil capacity and service interval can vary by year, so confirm them in your owner’s manual or with a Honda service center. Are you asking about engine oil or another part?`;
      }
    }

    if (query.includes('pressure') || query.includes('psi')) {
      if (selectedVehicle && selectedVehicle.condition) {
        const condition = selectedVehicle.condition;
        return `For your ${selectedVehicle.name}, the saved pressures are ${condition.frontTyrePressure || 'not set'} PSI front and ${condition.rearTyrePressure || 'not set'} PSI rear. Follow the vehicle label or owner’s manual for the correct cold pressure.`;
      }
      return `Use the tyre pressure on your vehicle’s door-frame label or owner’s manual, measured when tyres are cold. What vehicle model do you have?`;
    }

    if (query.includes('oil')) {
      if (selectedVehicle && selectedVehicle.name.toLowerCase().includes('activa')) {
        return `The Activa 125 commonly uses 10W-30 scooter oil. Check your model year’s manual for the exact oil grade, capacity and change interval.`;
      }
      return `Use the oil grade specified in your owner’s manual; the right grade depends on the engine and model year. Which vehicle are you asking about?`;
    }

    if (query.includes('mileage') || query.includes('fuel economy') || query.includes('km/l')) {
      return `Keep tyres at the recommended pressure, service the engine on schedule, and accelerate smoothly to help mileage. Tell me your vehicle and recent km/L reading for more specific advice.`;
    }

    // Check general vehicle condition or mileage advice queries
    if (query.includes('condition') || query.includes('health') || query.includes('check')) {
      if (selectedVehicle) {
        const cond = selectedVehicle.condition || {};
        return `${selectedVehicle.name} is marked ${cond.overallStatus || 'Good'} with a health score of ${cond.overallHealthScore || 90}%. The engine is listed as ${cond.engineStatus || 'Good'}; tyre pressure is ${cond.frontTyrePressure || 28} PSI front and ${cond.rearTyrePressure || 32} PSI rear. Want me to check a specific item?`;
      }
      return `Open a vehicle, choose “Health & Condition,” then select “Update Vehicle Condition.” You can record tyre, engine, brake and battery details there. Which check are you trying to record?`;
    }

    // Default response for general automotive advice
    const contextHeader = selectedVehicle ? `For your ${selectedVehicle.name}: ` : '';
    return `${contextHeader}I can help with maintenance, tyres, mileage and vehicle condition. What would you like to know?`;
  }
};
