require('dotenv').config({ path: '/Users/erzhuonie/Documents/GitHub/framenee1/framene-server/.env' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

(async () => {
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  const hash = await bcrypt.hash('12345678', 10);
  await p.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, '18128812778@163.com']);
  console.log('密码已更新');
  const r = await p.query('SELECT id, email, name FROM users WHERE email = $1', ['18128812778@163.com']);
  console.log('用户:', r.rows[0].email, r.rows[0].name);
  const u2 = await p.query('SELECT password_hash FROM users WHERE email = $1', ['18128812778@163.com']);
  const valid = await bcrypt.compare('12345678', u2.rows[0].password_hash);
  console.log('密码验证:', valid ? '正确' : '错误');
  await p.end();
})().catch(e => console.error('错误:', e.message));
