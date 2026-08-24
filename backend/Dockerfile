FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    ENVIRONMENT=production \
    DEBUG=false \
    HOST=0.0.0.0 \
    PORT=8000 \
    DATABASE_URL=sqlite:////data/edgemind.db

WORKDIR /app

RUN addgroup --system edgemind \
    && adduser --system \
       --ingroup edgemind \
       edgemind

COPY requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements.txt

COPY --chown=edgemind:edgemind app ./app
COPY --chown=edgemind:edgemind migrations ./migrations
COPY --chown=edgemind:edgemind alembic.ini ./alembic.ini

RUN mkdir -p /data \
    && chown -R edgemind:edgemind /app /data

USER edgemind

VOLUME ["/data"]

EXPOSE 8000

HEALTHCHECK \
  --interval=10s \
  --timeout=3s \
  --start-period=8s \
  --retries=3 \
  CMD python -c \
  "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=2)"

CMD ["sh", "-c", "alembic upgrade head && exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"]
