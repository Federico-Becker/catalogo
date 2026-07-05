require('dotenv/config');
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function verify() {
  const cats = await db.execute('SELECT COUNT(*) as count FROM categories');
  const prods = await db.execute('SELECT COUNT(*) as count FROM products');
  const offer = await db.execute('SELECT * FROM offer WHERE id=1');
  const catList = await db.execute('SELECT id, name FROM categories ORDER BY display_order');
  
  console.log(`Categorías: ${cats.rows[0].count}`);
  console.log(`Productos: ${prods.rows[0].count}`);
  console.log(`Oferta: ${offer.rows[0]?.name || 'ninguna'}`);
  console.log('\nLista de categorías:');
  catList.rows.forEach(c => console.log(`  - ${c.id}: ${c.name}`));
  
  const byCat = await db.execute('SELECT cat_id, COUNT(*) as count FROM products GROUP BY cat_id');
  console.log('\nProductos por categoría:');
  byCat.rows.forEach(r => console.log(`  - ${r.cat_id}: ${r.count}`));
  
  process.exit(0);
}

verify().catch(err => { console.error(err); process.exit(1); });
