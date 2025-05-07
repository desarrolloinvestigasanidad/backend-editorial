FROM node:18-slim


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
    chromium \
 && rm -rf /var/lib/apt/lists/*

 WORKDIR /app
 COPY package*.json ./
 
 # No queremos que puppeteer intente descargar otra vez Chromium
 ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
 
 RUN npm install --production
 COPY . .
 
 # Ya instalaste Chromium con apt, así que indicamos dónde está
 ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
 
 EXPOSE 8080
 ENV PORT=8080
 
 CMD ["node", "server.js"]
