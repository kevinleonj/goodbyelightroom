# Goodbye Lightroom – Cloudflare + Next.js photo albums

This repository replaces Adobe Portfolio with a statically generated Next.js 14 application hosted on Cloudflare Pages. Uploads land in Cloudflare Images and are indexed in Cloudflare D1. Everything is carefully commented so you can understand each moving part even without a deep technical background.

## 1. Prerequisites (follow in order)

1. **Install Node.js 20 LTS** (ships with npm 10). On Windows 11 or Windows 365 Cloud PC:
   - Browse to <https://nodejs.org/en/download>. Choose the "Windows Installer (.msi) 64-bit" option.
   - Double-click the downloaded file. Accept the licence, keep defaults, and finish the wizard.
   - Open **Windows Terminal** and run `node -v`. You should see `v20.x.x`.
2. **Install Git for Windows** (if not already present):
   - Download from <https://git-scm.com/download/win> and run the installer with defaults.
3. **Install Python 3.12** (needed for the uploader automation):
   - Download the Windows installer from <https://www.python.org/downloads/windows/>.
   - During setup **check “Add python.exe to PATH”** so commands work globally.
4. **Install Visual Studio Code** for editing:
   - Download from <https://code.visualstudio.com/>. Sign in with your Microsoft account to sync settings if you like.
5. **Optional – Azure Storage Explorer** if you prefer a GUI to inspect Cloudflare R2 via S3-compatible connections. Get it from the Microsoft Store.

## 2. Clone the project

Open Windows Terminal and run:

```powershell
cd C:\
mkdir dev\goodbyelightroom
cd dev\goodbyelightroom
git clone https://github.com/<your-account>/goodbyelightroom.git .
```

If you are following along inside GitHub Codespaces or VS Code Remote Containers, the directory already exists.

## 3. Install dependencies

Inside the project folder execute:

```powershell
npm install
```

> If your corporate firewall blocks npmjs.org, set an alternate registry first:
>
> ```powershell
> npm config set registry https://registry.npmjs.org/
> ```

Run the type checker and linter to confirm everything builds locally:

```powershell
npm run typecheck
npm run lint
```

Start the development server:

```powershell
npm run dev
```

Your terminal prints a localhost URL (usually <http://localhost:3000>). Open it in Microsoft Edge. The site updates live as you edit files.

## 4. Environment variables

Create a `.env.local` file (not committed) with your Cloudflare credentials:

```ini
CLOUDFLARE_ACCOUNT_ID=cf-account-id-here
CLOUDFLARE_IMAGES_TOKEN=token-with-images-permissions
REVALIDATE_TOKEN=choose-a-long-random-string
UPLOAD_API_TOKEN=choose-another-long-token
NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=https://...;
NEXT_PUBLIC_SITE_URL=https://kevinleonjouvin.com
```

Set the same secrets inside Cloudflare Pages → **Settings → Environment variables** for production.

## 5. Cloudflare setup checklist

1. **Cloudflare Pages project**
   - Connect the GitHub repository and pick the `npm run build` command with `NEXT_PRIVATE_TARGET=cloudflare-pages` (default).
2. **Cloudflare Images**
   - In the dashboard go to **Images → Variants** and create one named `public` with width breakpoints `480,960,1440,1920,2560`, `fit=cover`, `quality=auto`.
   - Create an API token scoped to **Account → Cloudflare Images → Edit**.
3. **Cloudflare R2**
   - Create a bucket `goodbyelightroom-originals` for raw exports.
   - Generate an R2 API token and store it in 1Password. This repo includes a Python uploader that mirrors uploads into R2.
4. **Cloudflare D1**
   - Create a database `goodbyelightroom`.
   - Run the SQL schema from [`infra/schema.sql`](infra/schema.sql) (see below) to create tables.
   - Bind the database to your Pages project as `DB`.
5. **Cloudflare Access**
   - Protect the `/admin` and `/api/*` paths. Allow only your Microsoft account email.
   - Generate a **service token** and store the client secret in `UPLOAD_API_TOKEN` so the uploader and admin UI can call the APIs.
6. **Analytics**
   - In Application Insights, create a new resource named `goodbyelightroom` and copy the connection string into `.env.local`.

## 6. Database schema

Execute this SQL inside Cloudflare D1 (Dashboard → D1 → Query editor):

```sql
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
```

## 7. Deployment pipeline

1. Commit and push to `main`.
2. Cloudflare Pages builds automatically using the latest commit.
3. After each successful upload request the Python uploader triggers `/api/revalidate` so the static album regenerates.

## 8. Admin and mobile workflow

- Desktop: Export from Lightroom Classic into the `watched` folder. The Python watcher (see [`tools/uploader/README.md`](tools/uploader/README.md)) uploads and moves files to the `uploaded` directory.
- Mobile: Visit `/admin` (protected by Cloudflare Access) and upload directly from your phone gallery.

## 9. Testing and quality gates

- `npm run typecheck` – verifies TypeScript types.
- `npm run lint` – enforces accessibility and security rules.
- `npm run build` – ensures Cloudflare-compatible static output.
- The repository ships with preview JSON data (`src/lib/albums.json`, `src/lib/photos.json`) so you can work offline.

## 10. Troubleshooting

| Issue | Fix |
| --- | --- |
| `npm ERR! 403 Forbidden` | Set `npm config set registry https://registry.npmjs.org/` or use GitHub Codespaces (already configured). |
| `fetch failed` when uploading | Confirm Cloudflare Access policy allows your email and token. |
| Images look soft | Increase Lightroom export resolution or adjust Cloudflare Images variant width. |

## 11. Respecting Adobe IP

All assets and pipelines here use your own Cloudflare storage. No Adobe code or styling is copied. You are free to migrate without infringing on Adobe’s intellectual property.
