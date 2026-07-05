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
  return res.json();
}

const categories = [
  { id: 'perfumes-masc', name: 'Perfumes Masculinos', display_order: 1 },
  { id: 'perfumes-fem', name: 'Perfumes Femeninos', display_order: 2 },
  { id: 'cuidado-corp', name: 'Cuidado Corporal', display_order: 3 },
  { id: 'cuidado-facial', name: 'Cuidado Facial', display_order: 4 },
  { id: 'maquillaje', name: 'Maquillaje', display_order: 5 },
  { id: 'deo', name: 'Desodorantes', display_order: 6 },
  { id: 'cabello', name: 'Cabello', display_order: 7 },
];

const products = [
  { name: 'Kaiak Aventura', gender: 'Masculino', price: '$43.960', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Kaiak Clásico', gender: 'Masculino', price: '$43.960', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Kaiak Sonar', gender: 'Masculino', price: '$43.960', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Kaiak Pulso', gender: 'Masculino', price: '$43.960', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Kaiak Urbe', gender: 'Masculino', price: '$43.960', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Conexión de Humor', gender: 'Masculino', price: '$42.140', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Humor Online', gender: 'Masculino', price: '$42.140', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Beijo de Humor', gender: 'Masculino', price: '$42.140', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Humor a Dois', gender: 'Masculino', type: 'MINI', price: '$24.560', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Homem Nos', gender: 'Masculino', price: '$55.790', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Kaiak Eau de Parfum', gender: 'Masculino', price: '$60.060', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: '300KM/H Quantum', gender: 'Masculino', price: '$22.900', cat_id: 'perfumes-masc', stock: 'disponible' },
  { name: 'Kaiak Oceano', gender: 'Femenino', price: '$43.960', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Kaiak Sonar', gender: 'Femenino', price: '$43.960', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Kaiak Clásico', gender: 'Femenino', price: '$43.960', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Humor Online', gender: 'Femenino', price: '$56.800', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Humor Liberta', gender: 'Unisex', price: '$42.140', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Humor Transforma', gender: 'Unisex', price: '$42.140', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Humor Da Minha Vida', gender: 'Femenino', price: '$42.140', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Humor Da Minha Vida', gender: 'Femenino', type: 'KIT X2', price: '$59.000', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Beijo de Humor', gender: 'Femenino', price: '$42.140', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Humor Meu Primeiro', gender: 'Femenino', price: '$42.140', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Ilia Flor de Laranjeira', gender: 'Femenino', price: '$79.000', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Una Art', gender: 'Femenino', price: '$79.000', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Luna Absoluta', gender: 'Femenino', price: '$65.000', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Secret Fantasy Dreams', gender: 'Femenino', price: '$23.400', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Timeless', gender: 'Femenino', price: '$28.800', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Today Tomorrow Always Radiance', gender: 'Femenino', price: '$55.600', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Today Tomorrow Always Everlasting', gender: 'Femenino', price: '$55.600', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Colonia Refrescante Imari', gender: 'Femenino', price: '$5.600', cat_id: 'perfumes-fem', stock: 'disponible' },
  { name: 'Ekos Açaí', gender: 'Unisex', price: '$32.480', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Ekos Castaña', gender: 'Unisex', price: '$32.480', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Ekos Pitanga', gender: 'Unisex', price: '$32.480', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Ekos Pitanga Preta', gender: 'Unisex', price: '$32.480', cat_id: 'cuidado-corp', stock: 'sin-stock' },
  { name: 'Refill Ekos Pitanga', gender: 'Unisex', price: '$27.300', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Aceite Corporal Pitanga Preta', gender: 'Unisex', type: 'MINI', price: '$15.000', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Ekos Maracuyá Aromatizante', gender: 'Unisex', price: '$29.500', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Body Ciruela y Flor de Vainilla', gender: 'Unisex', price: '$23.700', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Body Frambuesa y Pimienta Rosa', gender: 'Unisex', price: '$23.700', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Body Algodón', gender: 'Unisex', price: '$23.700', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Body Té de Manzanilla y Lavanda', gender: 'Unisex', price: '$23.700', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Crema de Manos Frutas Rojas', gender: 'Unisex', price: '$5.000', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Crema Acerola e Hibisco', gender: 'Unisex', price: '$16.600', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Jabón Líquido de Algodón', gender: 'Unisex', price: '$8.600', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Jabones Acerola e Hibisco', gender: 'Unisex', type: 'CAJA X5', price: '$11.900', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Jabón Líquido Erva Doce', gender: 'Unisex', price: '$15.800', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Deo Erva Doce en Crema', gender: 'Unisex', price: '$5.500', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Bálsamo Labial Cacaú', gender: 'Unisex', price: '$8.320', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Care Aceite de Coco', gender: 'Unisex', type: '1L', price: '$24.800', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Care Palta', gender: 'Unisex', type: '400ML', price: '$8.600', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Crema de Manos Sandía', gender: 'Unisex', price: '$5.900', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Crema de Manos Frutas Tropicales', gender: 'Unisex', price: '$5.900', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Crema de Manos Aceite de Coco', gender: 'Unisex', price: '$5.900', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Crema de Manos Aceite de Jojoba y Karité', gender: 'Unisex', price: '$5.900', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Loción Perfumada Attraction Desire', gender: 'Femenino', price: '$5.200', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Loción Perfumada Far Away', gender: 'Femenino', price: '$5.200', cat_id: 'cuidado-corp', stock: 'disponible' },
  { name: 'Anew Reversalist Día', gender: 'Unisex', price: '$22.800', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Anew Reversalist Noche', gender: 'Unisex', price: '$22.800', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Anew Reversalist', gender: 'Unisex', type: 'KIT X2', price: '$42.000', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Power Contorno de Ojos y Labios', gender: 'Unisex', price: '$14.400', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Anew Protector Solar 30 FPS', gender: 'Unisex', price: '$22.900', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Desmaquillante Bifásico', gender: 'Unisex', price: '$21.600', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Refill Desmaquillante Bifásico', gender: 'Unisex', price: '$17.280', cat_id: 'cuidado-facial', stock: 'disponible' },
  { name: 'Máscara +Care', gender: 'Unisex', price: '$21.800', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Máscara Ultra Volume', gender: 'Unisex', type: 'WATERPROOF', price: '$18.000', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Máscara 5en1 Genius', gender: 'Unisex', price: '$29.900', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Máscara Panther Power', gender: 'Unisex', price: '$7.700', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Delineador Super Definition', gender: 'Unisex', type: 'BLACK', price: '$19.400', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Gel para Cejas', gender: 'Unisex', type: 'LIGHT BROWN', price: '$11.600', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Labial Brillante Ultra Perlado', gender: 'Unisex', type: 'GLOW CRYSTAL', price: '$10.000', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Iluminador Glow Up', gender: 'Unisex', type: 'ROSA SOLAR', price: '$8.200', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Esmalte Minnie', gender: 'Unisex', type: 'DOTS BLANCOS', price: '$3.800', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Esmalte Crushed Crystals', gender: 'Unisex', type: 'TEQUILA SUNRISE', price: '$11.700', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Rubor Facial en Crema', gender: 'Unisex', type: 'SUNSET RADIANTE', price: '$16.800', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Bálsamo Labial Tododia', gender: 'Unisex', type: 'ACEROLA E HIBISCO', price: '$9.800', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Kriska Drama', gender: 'Femenino', price: '$38.600', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Kriska Clásico', gender: 'Femenino', price: '$38.600', cat_id: 'maquillaje', stock: 'disponible' },
  { name: 'Deo Kaiak Clásico', gender: 'Femenino', price: '$11.920', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo Humor Liberta', gender: 'Unisex', price: '$11.920', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo Humor Transforma', gender: 'Unisex', price: '$11.920', cat_id: 'deo', stock: 'disponible' },
  { name: 'Roll-On Homem', gender: 'Masculino', type: 'SIN PERFUME', price: 'S/C', cat_id: 'deo', stock: 'sin-stock' },
  { name: 'Roll-On 300KM/H Boost', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Roll-On 300KM/H Electric', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Roll-On 300KM/H', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Roll-On Musk Rain', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo en Aerosol 300KM/H', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo en Aerosol Legacy', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo en Aerosol Trekking', gender: 'Masculino', price: '$5.000', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo Far Away', gender: 'Femenino', price: '$3.900', cat_id: 'deo', stock: 'disponible' },
  { name: 'Deo Pur Blanca', gender: 'Femenino', price: '$3.900', cat_id: 'deo', stock: 'disponible' },
  { name: 'Acondicionador Todo Tipo de Cabellos', gender: 'Unisex', price: '$7.900', cat_id: 'cabello', stock: 'disponible' },
  { name: 'Acondicionador Cabellos Rizados', gender: 'Unisex', price: '$7.900', cat_id: 'cabello', stock: 'disponible' },
];

const defaultOffer = {
  name: 'Humor Liberta',
  description: 'Eau de Toilette + Deo Corporal · Unisex',
  price: '$49.600',
  img: '',
};

async function seed() {
  console.log('Creando tablas...');

  await execute(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
  )`);

  await execute(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT DEFAULT '',
    type TEXT DEFAULT '',
    price TEXT DEFAULT '',
    cat_id TEXT,
    stock TEXT DEFAULT 'disponible',
    img TEXT DEFAULT ''
  )`);

  await execute(`CREATE TABLE IF NOT EXISTS offer (
    id INTEGER CHECK (id = 1) PRIMARY KEY,
    name TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price TEXT DEFAULT '',
    img TEXT DEFAULT ''
  )`);

  console.log('Insertando categorías...');
  for (const cat of categories) {
    await execute(
      'INSERT OR IGNORE INTO categories (id, name, display_order) VALUES (?, ?, ?)',
      [cat.id, cat.name, cat.display_order]
    );
  }

  console.log('Insertando productos...');
  for (const p of products) {
    await execute(
      'INSERT INTO products (name, gender, type, price, cat_id, stock, img) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p.name, p.gender, p.type || '', p.price, p.cat_id, p.stock, p.img || '']
    );
  }

  console.log('Insertando oferta default...');
  await execute(
    'INSERT OR IGNORE INTO offer (id, name, description, price, img) VALUES (1, ?, ?, ?, ?)',
    [defaultOffer.name, defaultOffer.description, defaultOffer.price, defaultOffer.img]
  );

  console.log('Seed completado: 7 categorías, 92 productos, 1 oferta.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
