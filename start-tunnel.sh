#!/bin/bash

# Скрипт для запуска CallSpace с различными туннелями

echo "🌍 Starting CallSpace with tunnel..."

# Проверяем доступные туннели
TUNNEL_OPTIONS=()

# Проверяем cloudflared
if command -v cloudflared &> /dev/null; then
    TUNNEL_OPTIONS+=("cloudflared")
fi

# Проверяем localtunnel
if command -v lt &> /dev/null; then
    TUNNEL_OPTIONS+=("localtunnel")
fi

# Проверяем serveo
TUNNEL_OPTIONS+=("serveo")

# Проверяем localhost.run
TUNNEL_OPTIONS+=("localhost.run")

echo "Available tunnel options:"
for i in "${!TUNNEL_OPTIONS[@]}"; do
    echo "  $((i+1)). ${TUNNEL_OPTIONS[$i]}"
done

# Выбираем туннель
if [ ${#TUNNEL_OPTIONS[@]} -eq 0 ]; then
    echo "❌ No tunnel options available"
    echo "💡 Install cloudflared or localtunnel:"
    echo "   brew install cloudflared"
    echo "   npm install -g localtunnel"
    exit 1
fi

# Используем первый доступный туннель
TUNNEL_TYPE=${TUNNEL_OPTIONS[0]}
echo "🚀 Using tunnel: $TUNNEL_TYPE"

# Запускаем сервер если не запущен
if ! curl -s http://localhost:3000/api/users > /dev/null; then
    echo "🚀 Starting CallSpace server..."
    cd server
    node server.js &
    SERVER_PID=$!
    cd ..
    sleep 3
fi

# Запускаем туннель
case $TUNNEL_TYPE in
    "cloudflared")
        echo "🌐 Starting cloudflared tunnel..."
        cloudflared tunnel --url http://localhost:3000 &
        TUNNEL_PID=$!
        sleep 5
        ;;
    "localtunnel")
        echo "🌐 Starting localtunnel..."
        lt --port 3000 --subdomain callspace-$(date +%s) &
        TUNNEL_PID=$!
        sleep 5
        ;;
    "serveo")
        echo "🌐 Starting serveo tunnel..."
        ssh -R 80:localhost:3000 serveo.net &
        TUNNEL_PID=$!
        sleep 5
        ;;
    "localhost.run")
        echo "🌐 Starting localhost.run tunnel..."
        ssh -R 80:localhost:3000 localhost.run &
        TUNNEL_PID=$!
        sleep 5
        ;;
esac

echo ""
echo "🎉 CallSpace is now accessible!"
echo ""
echo "🌐 Check the tunnel output above for public URL"
echo "🏠 Local URL: http://localhost:3000"
echo ""
echo "🛑 To stop: Press Ctrl+C or run ./stop-tunnel.sh"

# Ждем сигнала остановки
trap 'echo "🛑 Stopping tunnel..."; kill $TUNNEL_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; exit 0' INT TERM

# Держим скрипт запущенным
while true; do
    sleep 10
done
