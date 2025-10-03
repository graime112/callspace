#!/bin/bash

# Скрипт для получения публичного URL CallSpace

echo "🔍 Getting CallSpace public URL..."

# Проверяем, запущен ли ngrok
if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
    echo "❌ ngrok is not running"
    echo "💡 Start public access with: ./start-public.sh"
    exit 1
fi

# Получаем URL из ngrok API
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Could not get public URL"
    exit 1
fi

echo "🌐 Public URL: $PUBLIC_URL"
echo ""
echo "📱 Share these links:"
echo "   💬 Messenger: $PUBLIC_URL/messenger.html"
echo "   👥 Admin Panel: $PUBLIC_URL/admin.html"
echo "   🏠 Home: $PUBLIC_URL/"
echo ""
echo "📊 ngrok Dashboard: http://localhost:4040"

# Сохраняем URL в файл
echo "$PUBLIC_URL" > .public-url
echo "💾 URL saved to .public-url"
