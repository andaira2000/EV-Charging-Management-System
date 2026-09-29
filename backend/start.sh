#!/bin/bash

# Start Celery workers in the background
service redis-server start &

# Run migrations on startup
python manage.py migrate --noinput

celery -A myproject worker --loglevel=info &

# Start the Django server
daphne -b 0.0.0.0 -p ${PORT:-8000} myproject.asgi:application
