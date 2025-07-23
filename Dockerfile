# Etapa 1: Definir la imagen base
# Usamos una imagen oficial de Node.js. La versión 'alpine' es muy ligera,
# lo que es ideal para despliegues en la nube como Cloud Run.
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor.
# Todas las acciones posteriores se ejecutarán desde esta ruta.
WORKDIR /usr/src/app

# Copia los archivos de definición de dependencias.
# El '*' asegura que tanto package.json como package-lock.json se copien.
# Hacemos esto en un paso separado para aprovechar el caché de capas de Docker.
COPY package*.json ./

# Instala las dependencias de producción. 'npm ci' es más rápido y seguro para builds
# porque instala las versiones exactas del package-lock.json.
RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación al directorio de trabajo.
# El archivo .dockerignore se encargará de no copiar archivos innecesarios.
COPY . .

# Expone el puerto en el que la aplicación se ejecuta dentro del contenedor.
EXPOSE 3000

# Define el comando para ejecutar la aplicación cuando el contenedor se inicie.
# Esto utiliza el script 'start' que añadiremos a package.json.
CMD [ "npm", "start" ]