FROM python:3.10-slim

# 필요한 패키지 설치 (크롬 브라우저 구동용)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render.com은 기본적으로 PORT 환경변수를 제공합니다
EXPOSE 8080

CMD uvicorn api:app --host 0.0.0.0 --port ${PORT:-8080}
