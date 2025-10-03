# 🌍 Публичный доступ к CallSpace

## 🚀 Быстрые способы

### 1. Облачные платформы (Рекомендуется)

#### Heroku (Бесплатно)
```bash
# Установите Heroku CLI
# Создайте приложение
heroku create your-callspace-app

# Настройте email
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password

# Разверните
git push heroku main
```

#### Railway (Бесплатно)
```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите и разверните
railway login
railway init
railway up
```

#### Vercel (Бесплатно)
```bash
# Установите Vercel CLI
npm install -g vercel

# Разверните
vercel --prod
```

### 2. Автоматическое развертывание
```bash
# Запустите скрипт развертывания
./deploy.sh
```

### 3. Docker (Локально)
```bash
# Соберите и запустите
docker build -t callspace .
docker run -p 3000:3000 callspace
```

## 🌐 Туннели (Для тестирования)

### Cloudflared (Рекомендуется)
```bash
# Установите cloudflared
brew install cloudflared

# Запустите туннель
./start-tunnel.sh
```

### Localhost.run
```bash
# Запустите сервер
cd server && node server.js &

# Создайте туннель
ssh -R 80:localhost:3000 localhost.run
```

### Serveo
```bash
# Запустите сервер
cd server && node server.js &

# Создайте туннель
ssh -R 80:localhost:3000 serveo.net
```

## 🔧 Настройка

### 1. Настройте email
```bash
# Создайте .env файл
cp email-config.example .env

# Отредактируйте настройки
nano .env
```

### 2. Перезапустите сервер
```bash
./restart-server.sh
```

## 📱 Доступ к сервису

После развертывания CallSpace будет доступен по:

- **💬 Мессенджер:** `https://your-domain.com/messenger.html`
- **👥 Админ-панель:** `https://your-domain.com/admin.html`
- **🏠 Главная:** `https://your-domain.com/`

## 🔗 Поделиться ссылками

### Для пользователей:
- Отправьте ссылку на мессенджер
- Пользователи могут сразу начать общаться

### Для администраторов:
- Отправьте ссылку на админ-панель
- Управляйте пользователями удаленно

## 🛠️ Управление

### Запуск
```bash
# Локально
./restart-server.sh

# С туннелем
./start-tunnel.sh

# Docker
docker-compose up -d
```

### Остановка
```bash
# Локально
./stop-public.sh

# С туннелем
./stop-tunnel.sh

# Docker
docker-compose down
```

### Проверка статуса
```bash
# Проверить сервер
curl http://localhost:3000/api/server/info

# Проверить пользователей
curl http://localhost:3000/api/users
```

## 🔒 Безопасность

### Для продакшена:
1. **Используйте HTTPS** (автоматически на облачных платформах)
2. **Настройте сильные пароли** для email
3. **Ограничьте доступ** к админ-панели
4. **Регулярно обновляйте** зависимости

### Переменные окружения:
```env
# Обязательные
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Опциональные
NODE_ENV=production
PORT=3000
PUBLIC_URL=https://your-domain.com
```

## 🚨 Устранение проблем

### Сервер не запускается
```bash
# Проверьте логи
cd server && node server.js

# Проверьте порт
lsof -i :3000
```

### Email не работает
```bash
# Проверьте конфигурацию
curl http://localhost:3000/api/email/config

# Протестируйте отправку
node test-email.js
```

### WebRTC не работает
- Убедитесь, что используется HTTPS
- Проверьте настройки STUN/TURN серверов
- Попробуйте другой браузер

## 📊 Мониторинг

### Логи сервера
```bash
# PM2 (если используется)
pm2 logs callspace

# Docker
docker logs callspace

# Прямой запуск
cd server && node server.js
```

### Статистика
```bash
# API статистика
curl http://localhost:3000/api/server/info

# Пользователи
curl http://localhost:3000/api/users
```

## 🎯 Рекомендации

### Для тестирования:
- Используйте localhost.run или serveo
- Heroku для быстрого развертывания

### Для продакшена:
- Railway или Render для простоты
- VPS с Docker для контроля
- AWS/GCP для масштабирования

### Для корпоративного использования:
- Собственный сервер с SSL
- Настройте домен
- Используйте CDN для статики
