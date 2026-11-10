/* eslint-disable no-console -- CLI */
const config = require('../src/config/env');
const { sql, getPool, closePool } = require('../src/config/database');
const { hashPassword } = require('../src/utils/password');

async function run() {
  const { email, password, fullName, phone } = config.admin;
  if (!email || !password) {
    throw new Error('Thiếu ADMIN_EMAIL hoặc ADMIN_PASSWORD trong .env');
  }

  const passwordHash = await hashPassword(password);
  const pool = await getPool();
  const normalizedEmail = email.toLowerCase();

  const adminRow = await pool
    .request()
    .query(`SELECT TOP 1 UserId AS id, Email AS email FROM dbo.Users WHERE Role = N'Admin' ORDER BY UserId`);

  if (!adminRow.recordset.length) {
    console.error('Không tìm thấy user Admin. Chạy: npm run db:seed');
    process.exitCode = 1;
    return;
  }

  const adminId = adminRow.recordset[0].id;
  const request = pool.request();
  request.input('id', sql.Int, adminId);
  request.input('email', sql.NVarChar(150), normalizedEmail);
  request.input('passwordHash', sql.NVarChar(255), passwordHash);
  request.input('fullName', sql.NVarChar(100), fullName || 'Quản trị viên');
  request.input('phone', sql.NVarChar(20), phone ?? null);

  await request.query(`
    UPDATE dbo.Users
    SET Email = @email,
        PasswordHash = @passwordHash,
        FullName = @fullName,
        Phone = @phone,
        UpdatedAt = SYSUTCDATETIME()
    WHERE UserId = @id
  `);

  console.log(`Đã đồng bộ Admin (UserId=${adminId}): ${normalizedEmail}`);
}

run()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(closePool);
