-- سیستم مدیریت داروخانه - PostgreSQL schema
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'pharmacist' CHECK (role IN ('admin','pharmacist')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id                    SERIAL PRIMARY KEY,
  code                  VARCHAR(40) UNIQUE NOT NULL,
  name                  VARCHAR(150) NOT NULL,
  generic_name          VARCHAR(150),
  manufacturer          VARCHAR(150),
  category              VARCHAR(80),
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  unit_price            NUMERIC(12,0) NOT NULL CHECK (unit_price >= 0),
  stock_quantity        INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_level         INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
  expiry_date           DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines (name);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines (expiry_date);

CREATE TABLE IF NOT EXISTS customers (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(120) NOT NULL,
  phone       VARCHAR(20) UNIQUE,
  national_id VARCHAR(20),
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id           SERIAL PRIMARY KEY,
  invoice_no   VARCHAR(30) UNIQUE NOT NULL,
  customer_id  INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  total_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  discount     NUMERIC(12,0) NOT NULL DEFAULT 0,
  paid_amount  NUMERIC(12,0) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales (created_at);

CREATE TABLE IF NOT EXISTS sale_items (
  id          SERIAL PRIMARY KEY,
  sale_id     INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,0) NOT NULL,
  line_total  NUMERIC(12,0) NOT NULL
);
