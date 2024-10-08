# syntax=docker/dockerfile:1.9.0

FROM python:3
LABEL authors="lim"

EXPOSE 443

WORKDIR /usr/src/app

COPY ./srcs ./srcs
COPY ./tools ./tools

ENV DJANGO_SETTINGS_MODULE config.settings.deployment

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN python3 -m venv ./venv
ENV PATH "$PWD/venv/bin:$PATH"
RUN <<EOF
pip3 install --upgrade pip
pip3 install --no-cache-dir -r ./tools/requirements.txt
chmod +x ./tools/docker-entrypoint.sh
EOF

RUN <<EOF
apt-get update
apt-get install -y openssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/C=KR/ST=Seoul/L=Seoul/O=42Seoul/CN=localhost/"
EOF

ENTRYPOINT [ "./tools/docker-entrypoint.sh" ]
