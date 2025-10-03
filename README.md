# 🎥 CallSpace - Video Calling Platform

CallSpace - это современная платформа для видеозвонков и онлайн-встреч с поддержкой WebRTC.

## ✨ Возможности

- 📹 **Высококачественные видеозвонки** - WebRTC технология
- 🎤 **Четкая передача звука** - аудио кодек Opus
- 🖥️ **Демонстрация экрана** - для презентаций
- 💬 **Обмен сообщениями** - в реальном времени
- 👥 **Групповые встречи** - до 10 участников
- 📧 **Приглашения по email** - автоматические уведомления
- 🔒 **Безопасное соединение** - HTTPS и шифрование

## 🚀 Быстрый старт

### Локальный запуск

```bash
# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/callspace.git
cd callspace

# Установите зависимости
npm install

# Настройте email (опционально)
cp email-config.example .env
# Отредактируйте .env с вашими настройками

# Запустите сервер
npm start
```

### Развертывание на Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/graime112/callspace)

1. **Нажмите кнопку выше** или перейдите на [Railway](https://railway.app)
2. **Подключите GitHub** (если не подключен)
3. **Выберите репозиторий:** `graime112/callspace`
4. **Нажмите "Deploy Now"**
5. **Настройте переменные окружения:**
   - `EMAIL_USER` - ваш email
   - `EMAIL_PASS` - пароль приложения
   - `NODE_ENV` - production

## 🔧 Настройка

### Переменные окружения

```env
# Email настройки (обязательно для приглашений)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Сервер
PORT=3000
NODE_ENV=production
```

### Настройка Gmail

1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения: https://myaccount.google.com/apppasswords
3. Используйте этот пароль в `EMAIL_PASS`

## 📱 Использование

### Для пользователей
- Откройте мессенджер: `/messenger.html`
- Зарегистрируйтесь или войдите
- Начните общение!

### Для администраторов
- Откройте админ-панель: `/admin.html`
- Управляйте пользователями
- Отправляйте приглашения

## 🛠️ Разработка

### Структура проекта

```
callspace/
├── client/           # Frontend (HTML, CSS, JS)
├── server/           # Backend (Node.js, Express)
├── android/          # Android приложение
├── deploy.sh         # Скрипт развертывания
└── README.md
```

### API Endpoints

- `GET /api/users` - список пользователей
- `POST /api/users/invite` - пригласить пользователя
- `GET /api/server/info` - информация о сервере

## 🚀 Развертывание

### Railway (Рекомендуется)

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите и разверните
railway login
railway init
railway up
```

### Heroku

```bash
# Установите Heroku CLI
# Создайте приложение
heroku create your-callspace-app

# Настройте переменные
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password

# Разверните
git push heroku main
```

### Docker

```bash
# Соберите образ
docker build -t callspace .

# Запустите контейнер
docker run -p 3000:3000 callspace
```

## 📊 Мониторинг

- **Логи сервера** - в панели Railway/Heroku
- **Статистика** - `/api/server/info`
- **Пользователи** - `/api/users`

## 🔒 Безопасность

- HTTPS автоматически на облачных платформах
- Валидация всех входных данных
- CORS настройки для публичного доступа
- Защита от CSRF атак

## 📞 Поддержка

При проблемах:
1. Проверьте логи сервера
2. Убедитесь, что переменные окружения настроены
3. Проверьте настройки email

## 📄 Лицензия

UNLICENSED - Все права защищены

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи
3. Внесите изменения
4. Создайте Pull Request

---

**CallSpace** - Современная платформа для видеозвонков 🎥