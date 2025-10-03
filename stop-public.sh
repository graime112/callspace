#!/bin/bash

# Скрипт для остановки публичного доступа CallSpace

echo "🛑 Stopping CallSpace public access..."

# Останавливаем ngrok
echo "⏹️ Stopping ngrok..."
pkill ngrok 2>/dev/null || echo "ngrok not running"

# Останавливаем сервер
echo "⏹️ Stopping server..."
pkill -f "node server.js" 2>/dev/null || echo "Server not running"

# Удаляем файл с URL
rm -f .public-url

echo "✅ Public access stopped"
echo "💡 To start again: ./start-public.sh"
