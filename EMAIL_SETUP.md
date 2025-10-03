# 📧 Настройка Email для CallSpace

## Обзор

CallSpace теперь поддерживает отправку email приглашений с красивыми HTML шаблонами и ссылками для входа в сервис.

## 🚀 Быстрая настройка

### 1. Настройка Gmail (Рекомендуется)

1. **Включите двухфакторную аутентификацию** в вашем Google аккаунте
2. **Создайте пароль приложения:**
   - Перейдите в [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Выберите "Mail" и "Other (Custom name)"
   - Введите "CallSpace" как название
   - Скопируйте сгенерированный пароль

3. **Создайте файл .env:**
   ```bash
   cp email-config.example .env
   ```

4. **Отредактируйте .env:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

5. **Перезапустите сервер:**
   ```bash
   ./restart-server.sh
   ```

### 2. Настройка других провайдеров

#### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yandex
```env
EMAIL_USER=your-email@yandex.ru
EMAIL_PASS=your-password
```

#### Mail.ru
```env
EMAIL_USER=your-email@mail.ru
EMAIL_PASS=your-password
```

## 🧪 Тестирование

### 1. Проверка конфигурации
```bash
curl http://localhost:3000/api/email/config
```

### 2. Тест отправки email
```bash
node test-email.js
```

### 3. Тест через админ-панель
1. Откройте `http://localhost:3000/admin.html`
2. Проверьте статус email (должен быть ✅)
3. Пригласите пользователя по email

## 📧 Что получают пользователи

### HTML Email с:
- 🎨 Красивым дизайном
- 📱 Адаптивной версткой
- 🔗 Прямой ссылкой для входа
- 📋 Информацией о сервисе
- 👤 Данными для входа

### Текстовая версия:
- Простое текстовое сообщение
- Ссылка для входа
- Инструкции по использованию

## 🔧 Настройка шаблонов

### Изменение HTML шаблона
Отредактируйте функцию `createInvitationTemplate` в `server/email-service.js`:

```javascript
function createInvitationTemplate(userData, inviteUrl) {
    // Ваш кастомный HTML здесь
}
```

### Изменение текста письма
Отредактируйте `mailOptions.text` в функции `sendInvitationEmail`.

## 🚨 Устранение проблем

### "Email not configured"
- Убедитесь, что файл `.env` существует
- Проверьте, что `EMAIL_USER` и `EMAIL_PASS` установлены
- Перезапустите сервер

### "Authentication failed"
- Для Gmail: используйте App Password, не обычный пароль
- Проверьте, что двухфакторная аутентификация включена
- Убедитесь, что "Less secure app access" включен (для других провайдеров)

### "Connection timeout"
- Проверьте интернет соединение
- Убедитесь, что SMTP порт не заблокирован
- Попробуйте другой email провайдер

### "Invalid email format"
- Проверьте формат email адреса
- Убедитесь, что нет лишних пробелов

## 📋 API Endpoints

### Проверка конфигурации
```bash
GET /api/email/config
```

### Приглашение пользователя
```bash
POST /api/users/invite
Content-Type: application/json

{
    "email": "user@example.com",
    "name": "User Name",
    "inviterId": "admin"
}
```

## 🔒 Безопасность

### Рекомендации:
1. **Никогда не коммитьте файл .env** в git
2. **Используйте App Passwords** вместо обычных паролей
3. **Ограничьте доступ** к админ-панели
4. **Регулярно обновляйте** пароли

### Переменные окружения:
```env
# Обязательные
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password

# Опциональные
PORT=3000
NODE_ENV=production
```

## 📊 Мониторинг

### Логи сервера
Сервер автоматически логирует:
- ✅ Успешную отправку email
- ❌ Ошибки отправки
- 📧 Детали приглашений

### Статус в админ-панели
- ✅ Email настроен
- ❌ Email не настроен
- ❓ Не удалось проверить

## 🎯 Примеры использования

### Приглашение через API
```javascript
const response = await fetch('/api/users/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'newuser@example.com',
        name: 'New User',
        inviterId: 'admin'
    })
});

const result = await response.json();
console.log('Email sent:', result.emailSent);
```

### Проверка статуса email
```javascript
const response = await fetch('/api/email/config');
const config = await response.json();
console.log('Email configured:', config.configured);
```

## 🚀 Продвинутые настройки

### Кастомные SMTP настройки
Отредактируйте `SMTP_CONFIG` в `server/email-service.js` для добавления новых провайдеров.

### Отправка в фоне
Для больших объемов рассмотрите использование очередей (Redis, Bull).

### Шаблоны по языкам
Добавьте поддержку множественных языков в шаблоны email.

## 📞 Поддержка

При проблемах:
1. Проверьте логи сервера
2. Запустите `node test-email.js`
3. Проверьте настройки SMTP
4. Убедитесь, что порты не заблокированы
