CREATE TABLE IF NOT EXISTS albums (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cover_image_id TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  album_slug TEXT NOT NULL REFERENCES albums(slug),
  filename_original TEXT,
  cf_image_id TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  alt TEXT,
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS photo_exif (
  photo_id TEXT PRIMARY KEY REFERENCES photos(id),
  make TEXT,
  model TEXT,
  lens TEXT,
  iso INTEGER,
  fnumber REAL,
  exposure_time TEXT,
  focal_length REAL,
  date_original TEXT,
  gps_lat REAL,
  gps_lon REAL
);
