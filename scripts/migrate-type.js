require('dotenv/config');

const DB_URL = process.env.TURSO_DATABASE_URL?.replace('libsql://', 'https://');
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function execute(sql, args = []) {
  const res = await fetch(`${DB_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map((a) => ({ type: 'text', value: String(a) })),
          },
        },
        { type: 'close' },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data;
}

async function query(sql, args = []) {
  const res = await execute(sql, args);
  const first = res.results?.[0];
  if (!first || first.type !== 'ok') return [];
  const result = first.response?.result;
  if (!result) return [];
  const cols = result.cols || [];
  return (result.rows || []).map((row) => {
    const obj = {};
    cols.forEach((col, i) => { obj[col.name] = row[i]?.value ?? row[i]; });
    return obj;
  });
}

async function migrate() {
  console.log('Agregando columna type...');
  await execute('ALTER TABLE products ADD COLUMN type TEXT DEFAULT ""');

  console.log('Obteniendo productos...');
  const products = await query('SELECT id, gender FROM products');

  for (const p of products) {
    const match = (p.gender || '').match(/^(.*?)\s*\((.+)\)\s*$/);
    if (match) {
      const newGender = match[1].trim();
      const type = match[2].trim();
      console.log(`  #${p.id}: "${p.gender}" → gender="${newGender}", type="${type}"`);
      await execute('UPDATE products SET gender=?, type=? WHERE id=?', [newGender, type, p.id]);
    } else {
      console.log(`  #${p.id}: "${p.gender}" → sin cambios`);
    }
  }

  console.log('Migración completada.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
