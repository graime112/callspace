# 🌐 Подробное руководство по ngrok

## 🎯 Что такое ngrok?

**ngrok** - это инструмент для создания безопасных туннелей из интернета к вашему локальному серверу. Идеально подходит для:
- Демонстрации проектов клиентам
- Тестирования веб-приложений с мобильных устройств  
- Разработки webhook'ов
- Быстрого деплоя без настройки серверов

## 🚀 Быстрый старт

### Вариант 1: Автоматический запуск
```bash
./start-ngrok.sh
```

### Вариант 2: Простой тест
```bash
./test-ngrok.sh
```

### Вариант 3: Ручной запуск
```bash
# Терминал 1: Запуск сервера
cd server && npm start

# Терминал 2: Запуск ngrok
ngrok http 3000
```

## 📊 ngrok Dashboard

После запуска ngrok откройте **http://localhost:4040** - это веб-интерфейс ngrok:

### Что вы увидите:
- 🔗 **Public URL** - ваша публичная ссылка
- 📈 **Traffic** - статистика запросов в реальном времени
- 🔍 **Inspect** - детали каждого HTTP запроса
- ⚙️ **Status** - состояние туннеля

### Пример вывода:
```
Session Status    online
Account           your-email@example.com (Plan: Free)
Version           3.30.0
Region            United States (us)
Latency           45ms
Web Interface     http://127.0.0.1:4040
Forwarding        https://abc123.ngrok.io -> http://localhost:3000
Forwarding        http://abc123.ngrok.io -> http://localhost:3000
```

## 🔧 Продвинутые возможности

### 1. Кастомный поддомен (платная версия)
```bash
ngrok http 3000 --subdomain=my-webrtc-app
# Результат: https://my-webrtc-app.ngrok.io
```

### 2. Базовая аутентификация
```bash
ngrok http 3000 --basic-auth="username:password"
```

### 3. Региональные серверы
```bash
ngrok http 3000 --region=eu  # Европа
ngrok http 3000 --region=ap  # Азия
ngrok http 3000 --region=au  # Австралия
```

### 4. Конфигурационный файл
Создайте `~/.ngrok2/ngrok.yml`:
```yaml
version: "2"
authtoken: your_auth_token_here
tunnels:
  webrtc-web:
    addr: 3000
    proto: http
    bind_tls: true
  webrtc-ws:
    addr: 8080
    proto: http
```

Запуск:
```bash
ngrok start webrtc-web webrtc-ws
```

## 🔐 Безопасность

### Бесплатная версия:
- ✅ HTTPS шифрование
- ✅ Случайные URL
- ❌ Нет аутентификации
- ❌ URL меняется при перезапуске

### Платная версия ($8/месяц):
- ✅ Постоянные поддомены
- ✅ Базовая аутентификация
- ✅ IP whitelist
- ✅ Больше одновременных туннелей

## 📱 Тестирование с мобильных устройств

1. Запустите ngrok: `./start-ngrok.sh`
2. Получите HTTPS ссылку (например: `https://abc123.ngrok.io`)
3. Откройте ссылку на телефоне
4. Разрешите доступ к камере/микрофону
5. Тестируйте видеозвонки!

## 🌍 Как поделиться с пользователями

### Пошаговая инструкция для пользователей:

1. **Отправьте им:**
   ```
   🎥 Присоединяйтесь к видеозвонку!
   
   Ссылка: https://abc123.ngrok.io
   ID комнаты: meeting123
   
   Инструкция:
   1. Откройте ссылку
   2. Разрешите доступ к камере/микрофону  
   3. Введите ID комнаты: meeting123
   4. Нажмите "Присоединиться"
   ```

2. **Для групповых звонков:**
   - Все участники используют одну ссылку
   - Все вводят один ID комнаты
   - Подключение происходит автоматически

## ⚠️ Ограничения бесплатной версии

- **40 подключений/минуту** - достаточно для тестирования
- **URL меняется** при каждом перезапуске
- **1 туннель одновременно** - нужно выбрать либо HTTP, либо WebSocket
- **Нет кастомных доменов**

## 🔧 Решение проблем

### Проблема: "ngrok not found"
```bash
# macOS
brew install ngrok

# Linux
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin
```

### Проблема: "failed to start tunnel"
```bash
# Проверьте, что порт свободен
lsof -i :3000

# Убейте процесс, если нужно
kill -9 PID
```

### Проблема: WebSocket не работает
Для WebRTC нужны оба порта (3000 и 8080). В бесплатной версии ngrok можно запустить только один туннель.

**Решение 1:** Используйте один порт для всего
```javascript
// В server/server.js объедините HTTP и WebSocket на порт 3000
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });
server.listen(3000);
```

**Решение 2:** Платная версия ngrok
```bash
ngrok http 3000 &
ngrok http 8080 &
```

### Проблема: Камера не работает
- ngrok автоматически предоставляет HTTPS
- Убедитесь, что используете HTTPS ссылку (не HTTP)
- Проверьте разрешения браузера

## 📈 Мониторинг

### Просмотр трафика в реальном времени:
1. Откройте http://localhost:4040
2. Вкладка "Inspect" - все HTTP запросы
3. Вкладка "Status" - состояние туннеля

### Логи ngrok:
```bash
ngrok http 3000 --log=stdout
```

## 💡 Советы и трюки

### 1. Автоматическое получение URL
```bash
# Получить публичный URL программно
curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'
```

### 2. Webhook тестирование
```bash
# Для тестирования webhook'ов
ngrok http 3000 --log=stdout | grep "https://"
```

### 3. Постоянный URL (хак для бесплатной версии)
```bash
# Создайте алиас с фиксированным именем
echo 'alias start-webrtc="./start-ngrok.sh && echo URL: \$(curl -s localhost:4040/api/tunnels | jq -r .tunnels[0].public_url)"' >> ~/.zshrc
```

### 4. Интеграция с QR кодами
```bash
# Генерация QR кода для мобильных устройств
brew install qrencode
PUBLIC_URL=$(curl -s localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
echo $PUBLIC_URL | qrencode -t UTF8
```

## 🎯 Альтернативы ngrok

Если ngrok не подходит:

1. **localtunnel** (бесплатно)
   ```bash
   npm install -g localtunnel
   lt --port 3000
   ```

2. **serveo** (бесплатно)
   ```bash
   ssh -R 80:localhost:3000 serveo.net
   ```

3. **Cloudflare Tunnel** (бесплатно)
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

## 🚀 Готовые команды

```bash
# Быстрый старт
./start-ngrok.sh

# Только тест
./test-ngrok.sh

# Ручной запуск с логами
cd server && npm start &
ngrok http 3000 --log=stdout

# Получить URL
curl -s localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'

# Остановить все
pkill -f "node.*server" && pkill -f ngrok
```

ngrok - это идеальный инструмент для быстрого тестирования и демонстрации вашего WebRTC приложения! 🎉
