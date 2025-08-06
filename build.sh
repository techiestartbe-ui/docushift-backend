#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status.
set -o errexit

echo "--- Installing npm dependencies ---"
npm install

echo "--- Installing system dependencies (Ghostscript) ---"
apt-get update && apt-get install -y ghostscript

echo "--- Build finished successfully ---"