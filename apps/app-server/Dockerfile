FROM python:3

EXPOSE 8000

WORKDIR /usr/src/app

COPY ./srcs ./
COPY ./tools ./

ENV DJANGO_SETTINGS_MODULE config.settings.deployment
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN python3 -m venv ./venv
ENV PATH "$PWD/venv/bin:$PATH"
RUN <<EOF
pip3 install --upgrade pip
pip3 install --no-cache-dir -r ./requirements.txt
chmod +x ./docker-entrypoint.sh
EOF

ENTRYPOINT [ "./docker-entrypoint.sh" ]
