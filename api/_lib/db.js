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
        { type: 'execute', stmt: { sql, args: args.map(a => ({ type: 'text', value: String(a) })) } },
        { type: 'close' },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return { rows: [], lastInsertRowid: 0 };

  const cols = result.result?.columns || [];
  const rows = (result.result?.rows || []).map((row) => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]?.value; });
    return obj;
  });

  return {
    rows,
    lastInsertRowid: result.result?.last_insert_rowid || 0,
  };
}

async function query(sql, args = []) {
  const result = await execute(sql, args);
  return result.rows;
}

module.exports = { query, execute };
