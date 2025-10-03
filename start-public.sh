#!/bin/bash

# Скрипт для запуска CallSpace в публичном доступе

echo "🌍 Starting CallSpace Public Access..."

# Проверяем, запущен ли сервер
if ! curl -s http://localhost:3000/api/users > /dev/null; then
    echo "🚀 Starting CallSpace server..."
    cd server
    node server.js &
    SERVER_PID=$!
    cd ..
    
    # Ждем запуска сервера
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    # Проверяем, что сервер запустился
    if ! curl -s http://localhost:3000/api/users > /dev/null; then
        echo "❌ Failed to start server"
        exit 1
    fi
else
    echo "✅ Server already running"
fi

# Запускаем ngrok
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 --log=stdout &

# Ждем запуска ngrok
sleep 3

# Получаем публичный URL
echo "🔍 Getting public URL..."
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Failed to get public URL from ngrok"
    echo "💡 Make sure ngrok is running and accessible at http://localhost:4040"
    exit 1
fi

echo ""
echo "🎉 CallSpace is now publicly accessible!"
echo ""
echo "🌐 Public URL: $PUBLIC_URL"
echo "🏠 Local URL:  http://localhost:3000"
echo "📊 ngrok Dashboard: http://localhost:4040"
echo ""
echo "📱 Share these links:"
echo "   💬 Messenger: $PUBLIC_URL/messenger.html"
echo "   👥 Admin Panel: $PUBLIC_URL/admin.html"
echo "   🏠 Home: $PUBLIC_URL/"
echo ""
echo "🛑 To stop: Press Ctrl+C or run ./stop-public.sh"
echo ""

# Сохраняем URL в файл для других скриптов
echo "$PUBLIC_URL" > .public-url

# Ждем сигнала остановки
trap 'echo "🛑 Stopping public access..."; kill $SERVER_PID 2>/dev/null; pkill ngrok; rm -f .public-url; exit 0' INT TERM

# Держим скрипт запущенным
while true; do
    sleep 10
    # Проверяем, что ngrok еще работает
    if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
        echo "❌ ngrok connection lost, restarting..."
        ngrok http 3000 --log=stdout &
        sleep 3
        PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "🔄 New public URL: $PUBLIC_URL"
        echo "$PUBLIC_URL" > .public-url
    fi
done