# syntax=docker/dockerfile:1.9.0

FROM nginx:stable
LABEL authors="lim"

EXPOSE 443

#COPY tools/default.conf ./etc/nginx/conf.d/.

RUN <<EOF
mkdir /etc/nginx/ssl
chmod 700 /etc/nginx/ssl
apt-get update
apt-get install -y openssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/gylim.key -out /etc/nginx/ssl/gylim.pem -subj "/C=KR/ST=Seoul/L=Seoul/O=42Seoul/CN=localhost/"
EOF
