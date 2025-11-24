# Who is Who - Guía de Inicio

Sigue estos pasos para ejecutar la aplicación completa (Base de datos, Backend y Frontend).

## Requisitos Previos
- [Node.js](https://nodejs.org/) instalado.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose.

## Paso 1: Iniciar la Base de Datos (Redis)
1. Abre una terminal en la carpeta `redis`.
2. Ejecuta el siguiente comando para levantar el contenedor de Redis:
   ```bash
   docker-compose up -d
   ```

## Paso 2: Iniciar el Backend (Servidor)
1. Abre una **nueva** terminal en la carpeta `backend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   *El servidor debería indicar que está corriendo en el puerto 3000 y conectado a Redis.*

## Paso 3: Iniciar el Frontend (Cliente)
1. Abre una **tercera** terminal en la carpeta `frontend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación React:
   ```bash
   npm run dev
   ```
4. Abre el enlace que aparece (normalmente `http://localhost:5173`) en tu navegador.

## Cómo Jugar
1. Abre dos pestañas del navegador en `http://localhost:5173`.
2. Ingresa el mismo nombre de sala (ej: `sala1`) en ambas pestañas y pulsa "Join Game".
3. El juego comenzará automáticamente.
