# Usa una imagen base oficial de Node.js (puedes ajustar la versión según necesites)
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que la aplicación se ejecuta
EXPOSE 8080

# Comando para iniciar la aplicación (ajusta "app.js" o "npm start" según tu configuración)
CMD ["node", "server.js"]
