const DB_URL = process.env.TURSO_DATABASE_URL?.replace('libsql://', 'https://');
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function execute(sql, args = []) {
  const res = await fetch(`${DB_URL}/v2/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      statements: [{ q: sql, params: args }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const first = data.results?.[0];
  if (!first) return { rows: [], lastInsertRowid: 0 };

  if (first.err) throw new Error(first.err);

  const rows = (first.result?.rows || []).map((row) => {
    const obj = {};
    first.result?.cols?.forEach((col, i) => { obj[col.name] = row[i]; });
    return obj;
  });

  return {
    rows,
    lastInsertRowid: first.result?.last_insert_rowid || 0,
  };
}

async function query(sql, args = []) {
  const result = await execute(sql, args);
  return result.rows;
}

module.exports = { query, execute };
