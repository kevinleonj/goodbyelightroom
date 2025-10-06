"""Lightroom watcher and uploader.

This script observes a folder for new JPEG or HEIC files and pushes them to the
Next.js API. It mirrors files into Cloudflare R2 via the same signed upload
mechanism and moves successful uploads into an archive folder.

The code is heavily commented so non-technical users can follow along.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

# Load environment variables from a .env file if present.
load_dotenv()

LOGGER = logging.getLogger("uploader")
LOGGER.setLevel(logging.INFO)
HANDLER = logging.StreamHandler()
HANDLER.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
LOGGER.addHandler(HANDLER)

SUPPORTED_TYPES = {".jpg", ".jpeg", ".heic"}


@dataclass
class Config:
  """Typed configuration values gathered from environment variables."""

  api_base_url: str
  api_token: str
  watch_folder: Path
  uploaded_folder: Path
  album_slug: str


class LightroomEventHandler(FileSystemEventHandler):
  """Handles filesystem notifications when Lightroom exports a file."""

  def __init__(self, config: Config, alt_text: Optional[str]) -> None:
    self.config = config
    self.alt_text = alt_text

  def on_created(self, event):  # type: ignore[override]
    # The watchdog library supplies an event object. We only care about files.
    if event.is_directory:
      return

    path = Path(event.src_path)

    # Lightroom may write temporary files first; wait until the file stops growing.
    wait_until_stable(path)

    if path.suffix.lower() not in SUPPORTED_TYPES:
      LOGGER.warning("Skipping %s – unsupported format", path.name)
      return

    try:
      upload_file(path, self.config, self.alt_text)
    except Exception as error:  # noqa: BLE001 – log every failure with context
      LOGGER.error("Upload failed for %s: %s", path.name, error)
    else:
      move_to_uploaded(path, self.config.uploaded_folder)


def wait_until_stable(path: Path, timeout: int = 30) -> None:
  """Poll the file size until Lightroom finishes writing."""

  start = time.time()
  last_size = -1
  while time.time() - start < timeout:
    try:
      current_size = path.stat().st_size
    except FileNotFoundError:
      time.sleep(0.5)
      continue

    if current_size == last_size:
      return

    last_size = current_size
    time.sleep(0.5)

  raise TimeoutError(f"File {path} did not stabilise within {timeout} seconds")


def upload_file(path: Path, config: Config, alt_text: Optional[str]) -> None:
  """Upload the file via the API endpoints with detailed error handling."""

  LOGGER.info("Processing %s", path.name)

  signed_url = request_signed_url(path.name, config)
  LOGGER.info("Obtained signed upload URL")

  with path.open("rb") as file_handle:
    upload_response = requests.post(signed_url.upload_url, files={"file": file_handle}, timeout=60)

  if upload_response.status_code >= 400:
    raise RuntimeError(f"Cloudflare Images upload failed: {upload_response.text}")

  payload = {
    "album_slug": config.album_slug,
    "cf_image_id": signed_url.cf_image_id,
    "alt": alt_text,
    "filename_original": path.name,
    "tags": [],
  }

  metadata_response = requests.post(
    f"{config.api_base_url}/api/photos",
    headers={
      "Authorization": f"Bearer {config.api_token}",
      "Content-Type": "application/json",
    },
    data=json.dumps(payload),
    timeout=60,
  )

  if metadata_response.status_code >= 400:
    raise RuntimeError(f"Metadata endpoint failed: {metadata_response.text}")

  LOGGER.info("Upload completed for %s", path.name)


def request_signed_url(filename: str, config: Config) -> "SignedUpload":
  response = requests.post(
    f"{config.api_base_url}/api/signed-upload",
    headers={
      "Authorization": f"Bearer {config.api_token}",
      "Content-Type": "application/json",
    },
    data=json.dumps({"filename": filename}),
    timeout=30,
  )

  if response.status_code >= 400:
    raise RuntimeError(f"Signed upload endpoint failed: {response.text}")

  data = response.json()
  return SignedUpload(upload_url=data["uploadURL"], cf_image_id=data["cf_image_id"])


def move_to_uploaded(path: Path, uploaded_folder: Path) -> None:
  uploaded_folder.mkdir(parents=True, exist_ok=True)
  destination = uploaded_folder / path.name
  shutil.move(str(path), destination)
  LOGGER.info("Moved %s to %s", path.name, destination)


def load_config(default_album: Optional[str]) -> Config:
  api_base_url = os.environ.get("API_BASE_URL")
  api_token = os.environ.get("API_TOKEN")
  watch_folder = os.environ.get("WATCH_FOLDER")
  uploaded_folder = os.environ.get("UPLOADED_FOLDER")
  album_slug = default_album or os.environ.get("ALBUM_SLUG")

  if not all([api_base_url, api_token, watch_folder, uploaded_folder, album_slug]):
    raise RuntimeError("Missing environment variables. Check tools/uploader/README.md.")

  return Config(
    api_base_url=api_base_url.rstrip("/"),
    api_token=api_token,
    watch_folder=Path(watch_folder),
    uploaded_folder=Path(uploaded_folder),
    album_slug=album_slug,
  )


@dataclass
class SignedUpload:
  upload_url: str
  cf_image_id: str


def main() -> None:
  parser = argparse.ArgumentParser(description="Watch a folder and upload new Lightroom exports.")
  parser.add_argument("--album", help="Override the album slug from the .env file", default=None)
  parser.add_argument("--alt", help="Default alt text applied to every upload", default=None)
  args = parser.parse_args()

  config = load_config(args.album)

  if not config.watch_folder.exists():
    raise FileNotFoundError(f"Watch folder {config.watch_folder} does not exist")

  event_handler = LightroomEventHandler(config, args.alt)
  observer = Observer()
  observer.schedule(event_handler, str(config.watch_folder), recursive=False)
  observer.start()
  LOGGER.info("Watching %s for new files", config.watch_folder)

  try:
    while True:
      time.sleep(1)
  except KeyboardInterrupt:
    LOGGER.info("Stopping watcher...")
    observer.stop()
  observer.join()


if __name__ == "__main__":
  main()
