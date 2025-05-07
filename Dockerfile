# ─────────────────────────────────────────────────────────────────────────────
# 1) Base: Node.js slim (más compatible con Chrome headless que Alpine)
# ─────────────────────────────────────────────────────────────────────────────
FROM public.ecr.aws/docker/library/node:18-slim

# ─────────────────────────────────────────────────────────────────────────────
# 2) Instala las librerías nativas que necesita Chromium
# ─────────────────────────────────────────────────────────────────────────────
RUN apt-get update \
 && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
 && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────────────────────────────────────
# 3) Directorio de trabajo y deps
# ─────────────────────────────────────────────────────────────────────────────
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# ─────────────────────────────────────────────────────────────────────────────
# 4) Copia el resto del código
# ─────────────────────────────────────────────────────────────────────────────
COPY . .

# ─────────────────────────────────────────────────────────────────────────────
# 5) Exponer puerto y variables
# ─────────────────────────────────────────────────────────────────────────────
EXPOSE 8080
ENV PORT=8080

# ─────────────────────────────────────────────────────────────────────────────
# 6) Cmd de arranque
# ─────────────────────────────────────────────────────────────────────────────
CMD ["node", "server.js"]
