DROP TABLE IF EXISTS signature;

-- CREATE TABLE signature(
--   id SERIAL PRIMARY KEY,
--   first VARCHAR NOT NULL CHECK (first != ''),
--   last VARCHAR NOT NULL CHECK (last != ''),
--   signature VARCHAR NOT NULL CHECK (signature != '')
-- );

CREATE TABLE signature(
      id SERIAL PRIMARY KEY,
      signature TEXT NOT NULL,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )

