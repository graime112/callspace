# 📧 Быстрая настройка Email для CallSpace

## ✅ Система готова!

Email система уже интегрирована в CallSpace. Пользователи создаются, но email не отправляется, пока не настроены учетные данные.

## 🚀 Настройка за 3 шага

### 1. Создайте файл .env
```bash
cp email-config.example .env
```

### 2. Настройте Gmail (рекомендуется)
1. Включите 2FA в Google аккаунте
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. Отредактируйте .env:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### 3. Перезапустите сервер
```bash
./restart-server.sh
```

## 🧪 Проверка работы

### Тест через админ-панель
1. Откройте `http://localhost:3000/admin.html`
2. Статус email должен показать ✅
3. Пригласите пользователя - email отправится автоматически

### Тест через API
```bash
# Проверить конфигурацию
curl http://localhost:3000/api/email/config

# Пригласить пользователя
curl -X POST http://localhost:3000/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"User Name"}'
```

### Тест через скрипт
```bash
node test-email.js
```

## 📧 Что получают пользователи

### Красивое HTML письмо с:
- 🎨 Современным дизайном
- 📱 Адаптивной версткой  
- 🔗 Прямой ссылкой для входа
- 📋 Информацией о сервисе
- 👤 Данными для входа

### Ссылка для входа:
```
http://localhost:3000/?user=username
```

## 🔧 Другие провайдеры

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yandex
```env
EMAIL_USER=your-email@yandex.ru
EMAIL_PASS=your-password
```

## 🚨 Если не работает

1. **Проверьте .env файл** - должен быть в корне проекта
2. **Для Gmail** - используйте App Password, не обычный пароль
3. **Перезапустите сервер** после изменения .env
4. **Проверьте логи** сервера на ошибки

## 📊 Статус в админ-панели

- ✅ **Email настроен** - все работает
- ❌ **Email не настроен** - нужно настроить .env
- ❓ **Не удалось проверить** - проблема с сервером

## 🎯 Готово!

После настройки email:
1. Пользователи получают красивые приглашения
2. Ссылки ведут прямо в CallSpace
3. Автоматически создаются аккаунты
4. Все работает из админ-панели

### Следующие шаги:
- Настройте .env с вашими email данными
- Перезапустите сервер
- Протестируйте приглашение пользователя
