# syntax=docker/dockerfile:1.9.0

FROM nginx:stable-alpine
LABEL authors="lim"

COPY tools/default.conf ./etc/nginx/conf.d/.

RUN <<EOF
mkdir /etc/nginx/ssl
chmod 700 /etc/nginx/ssl
EOF

COPY tools/gylim.key /etc/nginx/ssl
COPY tools/gylim.pem /etc/nginx/ssl

# HEALTHCHECK --interval=10s --timeout=30s --start-period=10s --retries=3 CMD curl -f -k http://localhost/ > /dev/null
