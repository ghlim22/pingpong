#!/bin/bash

python3 manage.py collectstatic --noinput
python3 manage.py migrate
python3 manage.py createsuperuser --noinput --email $DJANGO_SUPERUSER_EMAIL --nickname $DJANGO_SUPERUSER_NICKNAME
#exec gunicorn --bind 0.0.0.0:8000 config.wsgi:application
#exec gunicorn --certfile=gylim.pem --keyfile=gylim.key --bind 0.0.0.0:443 config.wsgi:application
#exec gunicorn --certfile=gylim.pem --keyfile=gylim.key --bind 0.0.0.0:443 config.wsgi:application
#exec gunicorn --certfile=gylim.pem --keyfile=gylim.key --bind 0.0.0.0:443 --workers 3 --worker-class uvicorn.workers.UvicornWorker config.asgi:application

exec python -m gunicorn config.asgi:application --certfile=gylim.pem --keyfile=gylim.key --bind 0.0.0.0:443 -k uvicorn.workers.UvicornWorker