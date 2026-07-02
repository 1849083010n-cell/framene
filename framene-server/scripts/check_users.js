require('dotenv').config({ path: '/Users/erzhuonie/Documents/GitHub/framenee1/framene-server/.env' });
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const u1 = await p.query("SELECT id,email,name FROM users WHERE email='18128812778@163.com'");
  const u2 = await p.query("SELECT id,email,name FROM users WHERE email='1849083010n@gmail.com'");
  console.log('用户1:', u1.rows[0]?.id, u1.rows[0]?.email);
  console.log('用户2:', u2.rows[0]?.id, u2.rows[0]?.email);

  const c1 = await p.query('SELECT count(*) as c FROM calendar_events WHERE user_id=$1', [u1.rows[0]?.id||0]);
  const c2 = await p.query('SELECT count(*) as c FROM calendar_events WHERE user_id=$1', [u2.rows[0]?.id||0]);
  console.log('用户1 calendar_events:', c1.rows[0].c);
  console.log('用户2 calendar_events:', c2.rows[0].c);

  const w1 = await p.query("SELECT count(*) as c FROM web_calendar_events WHERE source_email='18128812778@163.com'");
  const w2 = await p.query("SELECT count(*) as c FROM web_calendar_events WHERE source_email='1849083010n@gmail.com'");
  console.log('用户1 web_calendar_events:', w1.rows[0].c);
  console.log('用户2 web_calendar_events:', w2.rows[0].c);

  console.log('web总:', (await p.query('SELECT count(*) as c FROM web_calendar_events')).rows[0].c);
  console.log('cal总:', (await p.query('SELECT count(*) as c FROM calendar_events')).rows[0].c);

  await p.end();
})().catch(e => console.error('错误:', e.message));
