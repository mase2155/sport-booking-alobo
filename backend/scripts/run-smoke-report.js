/* Chạy: node scripts/run-smoke-report.js — smoke API (cần .env + DB seed) */
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';

const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config/env');
const { addDays, today } = require('../src/utils/datetime');
const { pickFreeBookableSlot } = require('../tests/helpers/pickFreeSlot');

const results = [];
function log(id, name, ok, detail) {
  results.push({ id, name, ok, detail });
}

(async () => {
  const health = await request(app).get('/api/v1/health');
  log(
    'SMK-01',
    'GET /health',
    health.status === 200 && health.body.success,
    `status=${health.status}`,
  );

  const fields = await request(app).get('/api/v1/fields').query({ limit: 3, status: 'Active' });
  const fieldCount = fields.body.data?.length ?? 0;
  log('SMK-02', 'GET /fields (public)', fields.status === 200 && fieldCount > 0, `count=${fieldCount}`);

  const news = await request(app).get('/api/v1/news-posts');
  log('SMK-03', 'GET /news-posts', news.status === 200, `items=${news.body.data?.length ?? 0}`);

  const partners = await request(app).get('/api/v1/partner-items');
  log('SMK-04', 'GET /partner-items', partners.status === 200, `items=${partners.body.data?.length ?? 0}`);

  const noAuthStats = await request(app).get('/api/v1/stats/overview');
  log('SMK-05', 'GET /stats/overview không token', noAuthStats.status === 401, `status=${noAuthStats.status}`);

  const email = `smoke_${Date.now()}@test.local`;
  const reg = await request(app).post('/api/v1/auth/register').send({
    fullName: 'Smoke User',
    email,
    password: 'Test@123456',
    phone: '0909111222',
  });
  log('SMK-06', 'POST /auth/register', reg.status === 201, `status=${reg.status}`);

  const login = await request(app).post('/api/v1/auth/login').send({ email, password: 'Test@123456' });
  const token = login.body.data?.accessToken;
  log('SMK-07', 'POST /auth/login', login.status === 200 && !!token, `status=${login.status}`);

  const custStats = await request(app).get('/api/v1/stats/overview').set('Authorization', `Bearer ${token}`);
  log('SMK-08', 'Customer GET /stats/overview', custStats.status === 403, `status=${custStats.status}`);

  const agent = request(app);
  const picked = await pickFreeBookableSlot(agent);
  const book =
    picked &&
    (await agent
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fieldId: picked.field.id,
        timeSlotId: picked.slot.id,
        bookingDate: picked.bookingDate,
      customerName: 'Smoke',
      customerPhone: '0909111222',
        paymentMethod: 'Online',
        totalAmount: 1,
      }));

  const amountOk = book?.status === 201 && book.body.data?.totalAmount > 0;
  log(
    'SMK-09',
    'POST booking + BR08 (server tính giá)',
    amountOk,
    `status=${book?.status ?? 'no-slot'} amount=${book?.body?.data?.totalAmount ?? ''}`,
  );

  const dupEmail = await request(app).post('/api/v1/auth/register').send({
    fullName: 'Dup',
    email,
    password: 'Test@123456',
    phone: '0909111333',
  });
  log('SMK-10', 'Register trùng email', dupEmail.status === 409, `status=${dupEmail.status}`);

  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const candidates = [
    config.admin.email,
    'hathehung260923@gmail.com',
    'admin@sportbooking.vn',
  ].filter(Boolean);
  const adminEmails = [...new Set(candidates.map((e) => e.toLowerCase()))];

  let adminLogin = { status: 401, body: {} };
  for (const email of adminEmails) {
    const attempt = await request(app).post('/api/v1/auth/login').send({ email, password: adminPass });
    adminLogin = attempt;
    if (attempt.status === 200) break;
  }
  const adminToken = adminLogin.body.data?.accessToken;
  log(
    'SMK-11',
    'Admin login',
    adminLogin.status === 200 && adminLogin.body.data?.user?.role === 'Admin',
    `status=${adminLogin.status}`,
  );

  if (adminToken) {
    const overview = await request(app)
      .get('/api/v1/stats/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    log('SMK-12', 'Admin GET /stats/overview', overview.status === 200 && overview.body.success, `status=${overview.status}`);

    const revenue = await request(app)
      .get('/api/v1/stats/revenue')
      .query({ groupBy: 'day', fromDate: addDays(today(), -30), toDate: today() })
      .set('Authorization', `Bearer ${adminToken}`);
    log('SMK-13', 'Admin GET /stats/revenue', revenue.status === 200, `status=${revenue.status}`);
  } else {
    log('SMK-12', 'Admin GET /stats/overview', false, 'no admin token');
    log('SMK-13', 'Admin GET /stats/revenue', false, 'no admin token');
  }

  if (book?.status === 201) {
    const pay = await agent
      .post(`/api/v1/bookings/${book.body.data.id}/payment`)
      .set('Authorization', `Bearer ${token}`);
    const payOk =
      pay.status === 200 &&
      pay.body.data?.status === 'Confirmed' &&
      pay.body.data?.paymentStatus === 'Paid';
    log('SMK-14', 'POST payment Online -> Confirmed/Paid', payOk, `status=${pay.status}`);
  } else {
    log('SMK-14', 'POST payment', false, 'booking failed');
  }

  const sqli = await request(app).get('/api/v1/fields').query({ keyword: "'; DROP TABLE Users;--" });
  log('SMK-15', 'Search injection không 500', sqli.status === 200, `status=${sqli.status}`);

  const failed = results.filter((r) => !r.ok);
  const summary = {
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
