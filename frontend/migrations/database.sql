CREATE DATABASE golang_template;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  nik TEXT NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  password    TEXT NOT NULL,
  no_hp     TEXT NOT NULL,
  role        TEXT NOT NULL,
  tanggal_masuk    DATE NOT NULL,
  tanggal_lahir    DATE NOT NULL,
  tempat_lahir    DATE NOT NULL,
  alamat    TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP DATABASE golang_template;