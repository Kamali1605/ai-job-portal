#!/usr/bin/env bash
set -e

cd frontend/backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
