FROM nginx:stable-alpine
LABEL authors="lim"

COPY ./default.conf ./etc/nginx/conf.d/.

# HEALTHCHECK --interval=10s --timeout=30s --start-period=10s --retries=3 CMD curl -f -k http://localhost/ > /dev/null
