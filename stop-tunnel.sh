#!/bin/bash

# Скрипт для остановки туннеля CallSpace

echo "🛑 Stopping CallSpace tunnel..."

# Останавливаем все туннели
pkill cloudflared 2>/dev/null || echo "cloudflared not running"
pkill lt 2>/dev/null || echo "localtunnel not running"
pkill ssh 2>/dev/null || echo "ssh tunnels not running"

# Останавливаем сервер
pkill -f "node server.js" 2>/dev/null || echo "Server not running"

echo "✅ Tunnel stopped"
echo "💡 To start again: ./start-tunnel.sh"
