#!/bin/bash

cd srcs/

python3 manage.py collectstatic --noinput
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser --noinput --email $DJANGO_SUPERUSER_EMAIL --nickname $DJANGO_SUPERUSER_NICKNAME

#exec python -m gunicorn config.asgi:application --certfile=gylim.pem --keyfile=gylim.key --bind 0.0.0.0:443 -k uvicorn.workers.UvicornWorker

exec daphne -e ssl:443:privateKey=/usr/src/app/key.pem:certKey=/usr/src/app/cert.pem config.asgi:application
