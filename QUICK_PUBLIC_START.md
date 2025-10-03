# 🚀 Быстрый запуск CallSpace в публичном доступе

## ✅ Готово к развертыванию!

CallSpace полностью настроен для публичного доступа. Выберите подходящий способ:

## 🌐 Способ 1: Облачные платформы (Рекомендуется)

### Heroku (5 минут)
```bash
# 1. Установите Heroku CLI
# 2. Войдите в аккаунт
heroku login

# 3. Создайте приложение
heroku create your-callspace-app

# 4. Настройте email
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password

# 5. Разверните
git push heroku main
```

### Railway (3 минуты)
```bash
# 1. Установите Railway CLI
npm install -g @railway/cli

# 2. Войдите и разверните
railway login
railway init
railway up
```

### Vercel (2 минуты)
```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Разверните
vercel --prod
```

## 🐳 Способ 2: Docker (Локально)

```bash
# 1. Соберите образ
docker build -t callspace .

# 2. Запустите контейнер
docker run -d -p 3000:3000 --name callspace-app callspace

# 3. Откройте http://localhost:3000
```

## 🌍 Способ 3: Туннели (Для тестирования)

### Localhost.run (1 минута)
```bash
# 1. Запустите сервер
cd server && node server.js &

# 2. Создайте туннель
ssh -R 80:localhost:3000 localhost.run
```

### Serveo (1 минута)
```bash
# 1. Запустите сервер
cd server && node server.js &

# 2. Создайте туннель
ssh -R 80:localhost:3000 serveo.net
```

## 🔧 Настройка email (Обязательно)

### 1. Создайте .env файл
```bash
cp email-config.example .env
```

### 2. Настройте Gmail
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Как получить App Password:**
1. Включите 2FA в Google аккаунте
2. Перейдите на https://myaccount.google.com/apppasswords
3. Создайте пароль для "Mail"
4. Используйте этот пароль в .env

### 3. Перезапустите сервер
```bash
./restart-server.sh
```

## 📱 Доступ к сервису

После развертывания CallSpace будет доступен по:

- **💬 Мессенджер:** `https://your-domain.com/messenger.html`
- **👥 Админ-панель:** `https://your-domain.com/admin.html`
- **🏠 Главная:** `https://your-domain.com/`

## 🎯 Что можно делать

### Для пользователей:
- ✅ Регистрироваться и входить
- ✅ Отправлять сообщения
- ✅ Совершать видео/голосовые звонки
- ✅ Создавать групповые встречи
- ✅ Демонстрировать экран

### Для администраторов:
- ✅ Управлять пользователями
- ✅ Приглашать по email
- ✅ Просматривать статистику
- ✅ Модерировать контент

## 🔗 Поделиться

### С пользователями:
```
Привет! Присоединяйся к CallSpace - современной платформе для видеозвонков:

🌐 https://your-domain.com/messenger.html

Возможности:
📹 Высококачественные видеозвонки
💬 Обмен сообщениями
🖥️ Демонстрация экрана
👥 Групповые встречи
```

### С администраторами:
```
Админ-панель CallSpace:

👥 https://your-domain.com/admin.html

Функции:
➕ Добавление пользователей
📧 Приглашения по email
📊 Статистика и мониторинг
⚙️ Управление настройками
```

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
# API информация
curl http://localhost:3000/api/server/info

# Пользователи
curl http://localhost:3000/api/users

# Email статус
curl http://localhost:3000/api/email/config
```

## 🚨 Если что-то не работает

### Сервер не запускается
```bash
# Проверьте порт
lsof -i :3000

# Запустите вручную
cd server && node server.js
```

### Email не отправляется
```bash
# Проверьте .env файл
cat .env

# Протестируйте email
node test-email.js
```

### WebRTC не работает
- Убедитесь, что используется HTTPS
- Попробуйте другой браузер
- Проверьте настройки файрвола

## 🎉 Готово!

Теперь CallSpace доступен публично! Пользователи могут:

1. **Заходить по ссылке** и сразу начинать общаться
2. **Получать email приглашения** с прямыми ссылками
3. **Использовать все функции** без установки приложений
4. **Работать на любых устройствах** (компьютер, телефон, планшет)

### Следующие шаги:
1. Выберите способ развертывания
2. Настройте email
3. Поделитесь ссылками с пользователями
4. Наслаждайтесь CallSpace! 🎉
