#!/bin/bash

python3 manage.py collectstatic --noinput
python3 manage.py migrate

#exec gunicorn --bind 0.0.0.0:8000 config.wsgi:application
exec gunicorn --certfile=gylim.pem --keyfile=gylim.key --bind 0.0.0.0:443 config.wsgi:application
