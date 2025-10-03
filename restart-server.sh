#!/bin/bash

# Скрипт для перезапуска сервера CallSpace

echo "🔄 Restarting CallSpace server..."

# Останавливаем существующие процессы
echo "⏹️ Stopping existing server processes..."
pkill -f "node server.js" 2>/dev/null || echo "No existing server processes found"

# Ждем немного
sleep 2

# Переходим в папку сервера
cd "$(dirname "$0")/server"

# Запускаем сервер
echo "🚀 Starting server..."
node server.js &

# Ждем немного для запуска
sleep 3

# Проверяем, что сервер запустился
if curl -s http://localhost:3000/api/users > /dev/null; then
    echo "✅ Server started successfully!"
    echo "🌐 Admin panel: http://localhost:3000/admin.html"
    echo "💬 Messenger: http://localhost:3000/messenger.html"
    echo "🏠 Home: http://localhost:3000/"
else
    echo "❌ Server failed to start"
    exit 1
fi
