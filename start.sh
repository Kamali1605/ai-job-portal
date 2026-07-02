#!/usr/bin/env bash
set -e

cd frontend/backend
gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
