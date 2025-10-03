#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск WebRTC Video Calls через ngrok${NC}"
echo "=================================="

# Проверяем, что ngrok установлен
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok не установлен. Установите: brew install ngrok${NC}"
    exit 1
fi

# Проверяем, что Node.js установлен
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не установлен${NC}"
    exit 1
fi

# Переходим в папку сервера и устанавливаем зависимости
echo -e "${YELLOW}📦 Проверка зависимостей...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
    npm install
fi

# Запускаем сервер в фоне
echo -e "${YELLOW}🖥️  Запуск сервера...${NC}"
npm start &
SERVER_PID=$!

# Ждем запуска сервера
sleep 3

# Проверяем, что сервер запустился
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Сервер не запустился${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Сервер запущен на http://localhost:3000${NC}"

# Запускаем ngrok для веб-сервера
echo -e "${YELLOW}🌐 Создание публичного туннеля...${NC}"
ngrok http 3000 --log=stdout > ngrok.log &
NGROK_PID=$!

# Ждем запуска ngrok
sleep 5

# Получаем публичный URL
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['proto'] == 'https':
            print(tunnel['public_url'])
            break
except:
    pass
")

if [ -z "$PUBLIC_URL" ]; then
    echo -e "${RED}❌ Не удалось получить публичный URL${NC}"
    echo -e "${YELLOW}💡 Попробуйте открыть http://localhost:4040 в браузере${NC}"
else
    echo ""
    echo -e "${GREEN}🎉 Ваше приложение доступно по адресу:${NC}"
    echo -e "${GREEN}🔗 $PUBLIC_URL${NC}"
    echo ""
    echo -e "${BLUE}📋 Инструкции для пользователей:${NC}"
    echo -e "1. Откройте ссылку: ${GREEN}$PUBLIC_URL${NC}"
    echo -e "2. Разрешите доступ к камере и микрофону"
    echo -e "3. Введите ID комнаты (например: meeting123)"
    echo -e "4. Поделитесь этой ссылкой и ID комнаты с собеседником"
    echo ""
    echo -e "${YELLOW}📊 Статистика ngrok: http://localhost:4040${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  Для остановки нажмите Ctrl+C${NC}"
echo ""

# Функция для корректного завершения
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Остановка серверов...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    rm -f ngrok.log
    echo -e "${GREEN}✅ Серверы остановлены${NC}"
    exit 0
}

# Обработка сигнала завершения
trap cleanup SIGINT SIGTERM

# Показываем логи в реальном времени
echo -e "${BLUE}📝 Логи сервера (Ctrl+C для остановки):${NC}"
echo "=================================="
wait $SERVER_PID
