FROM postgres:alpine
LABEL authors="lim"

USER postgres

HEALTHCHECK --interval=10s --timeout=30s --retries=3 --start-period=10s CMD pg_isready
