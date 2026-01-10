CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name)
SELECT 'Perfumes'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Perfumes');

INSERT INTO categories (name)
SELECT 'Cosmetics'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Cosmetics');

-- Seed products (only if not present)
INSERT INTO products (name, price, category_id, brand, in_stock)
SELECT 'Perfume A', 50, (SELECT id FROM categories WHERE name='Perfumes'), 'BrandX', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Perfume A');

INSERT INTO products (name, price, category_id, brand, in_stock)
SELECT 'Perfume B', 80, (SELECT id FROM categories WHERE name='Perfumes'), 'BrandY', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Perfume B');
