# RVC_factor — container image
# Build:  docker build -t rvc-factor .
# Run:    docker run -p 5000:5000 -v rvc-data:/app/output rvc-factor
FROM python:3.11-slim

# System deps: libsndfile (soundfile), libgl1 (matplotlib headless), ffmpeg (librosa mp3)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libsndfile1 libgl1 libglib2.0-0 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Persist uploads, DB, generated figures/reports, and logs in one runtime tree.
RUN mkdir -p /app/output/uploads/audio /app/output/uploads/avatars \
    /app/output/picture /app/output/report /app/output/logs
VOLUME ["/app/output"]

ENV PORT=5000
EXPOSE 5000

# Production-grade WSGI server
CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:${PORT} app:app"]
