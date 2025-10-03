# Dockerfile для CallSpace
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
COPY server/package*.json ./server/

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S callspace -u 1001

# Меняем владельца файлов
RUN chown -R callspace:nodejs /app
USER callspace

# Открываем порт
EXPOSE 3000

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Команда запуска
CMD ["node", "server/server.js"]