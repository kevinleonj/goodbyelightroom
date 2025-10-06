# Lightroom automation uploader

This Python helper watches a folder and uploads new exports to the Next.js API.

## Install dependencies

```powershell
cd tools/uploader
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## Configure environment

Create `.env` in this folder:

```ini
API_BASE_URL=https://kevinleonjouvin.com
API_TOKEN=long-random-string-matching-cloudflare-access-service-token
WATCH_FOLDER=C:\\Photos\\watched
UPLOADED_FOLDER=C:\\Photos\\uploaded
ALBUM_SLUG=doggos
```

## Run the watcher

```powershell
python watch_and_upload.py --album doggos --alt "Optional default alt text"
```

The script moves processed files into the uploaded folder and logs every network call with clear error messages.
