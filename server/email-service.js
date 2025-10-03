// Email сервис для CallSpace
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Конфигурация SMTP
const SMTP_CONFIG = {
    // Для Gmail
    gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    },
    
    // Для Outlook/Hotmail
    outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'your-email@outlook.com',
            pass: process.env.EMAIL_PASS || 'your-password'
        }
    },
    
    // Для Yandex
    yandex: {
        host: 'smtp.yandex.ru',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'your-email@yandex.ru',
            pass: process.env.EMAIL_PASS || 'your-password'
        }
    },
    
    // Для Mail.ru
    mailru: {
        host: 'smtp.mail.ru',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'your-email@mail.ru',
            pass: process.env.EMAIL_PASS || 'your-password'
        }
    }
};

// Определяем провайдера по email
function getEmailProvider(email) {
    const domain = email.split('@')[1].toLowerCase();
    
    if (domain.includes('gmail.com')) return 'gmail';
    if (domain.includes('outlook.com') || domain.includes('hotmail.com')) return 'outlook';
    if (domain.includes('yandex.ru')) return 'yandex';
    if (domain.includes('mail.ru')) return 'mailru';
    
    // По умолчанию используем Gmail
    return 'gmail';
}

// Создаем transporter
function createTransporter(email) {
    const provider = getEmailProvider(email);
    const config = SMTP_CONFIG[provider];
    
    console.log(`📧 Using ${provider} SMTP for ${email}`);
    
    return nodemailer.createTransporter(config);
}

// HTML шаблон для приглашения
function createInvitationTemplate(userData, inviteUrl) {
    const { name, email, inviterName = 'CallSpace Team' } = userData;
    
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Приглашение в CallSpace</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: #4F46E5;
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .title {
            color: #4F46E5;
            font-size: 28px;
            margin: 0;
            font-weight: 600;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
            margin: 10px 0 0;
        }
        .content {
            margin: 30px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .features {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features h3 {
            color: #4F46E5;
            margin-top: 0;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin: 8px 0;
        }
        .cta-button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
        }
        .cta-button:hover {
            background: #4338CA;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .user-info {
            background: #e8f0fe;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .user-info strong {
            color: #4F46E5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CS</div>
            <h1 class="title">CallSpace</h1>
            <p class="subtitle">Видеозвонки и встречи</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Привет, ${name}! 👋
            </div>
            
            <p>${inviterName} приглашает вас присоединиться к CallSpace - современной платформе для видеозвонков и онлайн-встреч.</p>
            
            <div class="user-info">
                <strong>Ваши данные для входа:</strong><br>
                Email: ${email}<br>
                ID пользователя: ${email.split('@')[0]}
            </div>
            
            <div class="features">
                <h3>🚀 Что вас ждет в CallSpace:</h3>
                <ul>
                    <li>📹 Высококачественные видеозвонки</li>
                    <li>🎤 Четкая передача звука</li>
                    <li>🖥️ Демонстрация экрана</li>
                    <li>💬 Обмен сообщениями</li>
                    <li>👥 Групповые встречи</li>
                    <li>🔒 Безопасное соединение</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${inviteUrl}" class="cta-button">
                    🎉 Присоединиться к CallSpace
                </a>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px;">
                Или скопируйте ссылку: <br>
                <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${inviteUrl}</code>
            </p>
        </div>
        
        <div class="footer">
            <p>Это приглашение было отправлено автоматически.</p>
            <p>Если вы не ожидали это письмо, просто проигнорируйте его.</p>
            <p>© 2024 CallSpace. Все права защищены.</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Отправка приглашения
export async function sendInvitationEmail(userData, inviteUrl) {
    const { name, email, inviterName } = userData;
    
    try {
        console.log(`📧 Sending invitation email to ${email}...`);
        
        // Проверяем, настроен ли email
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('⚠️ Email not configured. Skipping email send.');
            console.log('💡 Set EMAIL_USER and EMAIL_PASS environment variables to enable email sending.');
            return { success: false, error: 'Email not configured' };
        }
        
        const transporter = createTransporter(email);
        
        // Проверяем соединение
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        
        const mailOptions = {
            from: `"CallSpace" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `🎉 Приглашение в CallSpace от ${inviterName}`,
            html: createInvitationTemplate(userData, inviteUrl),
            text: `
Привет, ${name}!

${inviterName} приглашает вас присоединиться к CallSpace.

Ваши данные для входа:
Email: ${email}
ID пользователя: ${email.split('@')[0]}

Ссылка для входа: ${inviteUrl}

CallSpace - современная платформа для видеозвонков и онлайн-встреч.

© 2024 CallSpace
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Invitation email sent to ${email}:`, result.messageId);
        
        return { 
            success: true, 
            messageId: result.messageId,
            message: 'Invitation email sent successfully'
        };
        
    } catch (error) {
        console.error('❌ Error sending invitation email:', error);
        return { 
            success: false, 
            error: error.message,
            message: 'Failed to send invitation email'
        };
    }
}

// Отправка тестового email
export async function sendTestEmail(testEmail) {
    const userData = {
        name: 'Test User',
        email: testEmail,
        inviterName: 'CallSpace Team'
    };
    
    const inviteUrl = `http://localhost:3000/?user=${testEmail.split('@')[0]}`;
    
    return await sendInvitationEmail(userData, inviteUrl);
}

// Проверка конфигурации email
export function checkEmailConfig() {
    const hasUser = !!process.env.EMAIL_USER;
    const hasPass = !!process.env.EMAIL_PASS;
    
    return {
        configured: hasUser && hasPass,
        hasUser,
        hasPass,
        message: hasUser && hasPass 
            ? 'Email is configured' 
            : 'Email not configured. Set EMAIL_USER and EMAIL_PASS environment variables.'
    };
}
