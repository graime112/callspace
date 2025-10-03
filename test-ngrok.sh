#!/bin/bash

echo "🧪 Тестовый запуск ngrok..."

# Запускаем сервер
cd server
npm start &
SERVER_PID=$!

echo "⏳ Ждем запуска сервера..."
sleep 3

# Запускаем ngrok
echo "🌐 Запуск ngrok..."
ngrok http 3000 &
NGROK_PID=$!

echo ""
echo "✅ Серверы запущены!"
echo "📊 Откройте http://localhost:4040 для просмотра ngrok dashboard"
echo "🔗 Скопируйте HTTPS URL и поделитесь с пользователями"
echo ""
echo "⚠️  Нажмите Ctrl+C для остановки"

# Ожидание завершения
trap "kill $SERVER_PID $NGROK_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
