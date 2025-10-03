#!/usr/bin/env node

// Тестовый скрипт для проверки отправки email
import { sendTestEmail, checkEmailConfig } from './server/email-service.js';

console.log('📧 Testing CallSpace Email System\n');

async function testEmail() {
    try {
        // 1. Проверяем конфигурацию
        console.log('1️⃣ Checking email configuration...');
        const config = checkEmailConfig();
        
        if (!config.configured) {
            console.log('❌ Email not configured');
            console.log('💡 To configure email:');
            console.log('   1. Copy email-config.example to .env');
            console.log('   2. Set EMAIL_USER and EMAIL_PASS');
            console.log('   3. For Gmail: use App Password (not regular password)');
            console.log('   4. Restart server');
            return;
        }
        
        console.log('✅ Email configuration found');
        console.log(`   User: ${process.env.EMAIL_USER}`);
        console.log(`   Password: ${process.env.EMAIL_PASS ? '***' : 'Not set'}`);
        
        // 2. Запрашиваем тестовый email
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const testEmail = await new Promise((resolve) => {
            rl.question('Enter test email address: ', resolve);
        });
        
        rl.close();
        
        if (!testEmail) {
            console.log('❌ No email provided');
            return;
        }
        
        // 3. Отправляем тестовое письмо
        console.log('\n2️⃣ Sending test email...');
        const result = await sendTestEmail(testEmail);
        
        if (result.success) {
            console.log('✅ Test email sent successfully!');
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Check inbox: ${testEmail}`);
        } else {
            console.log('❌ Failed to send test email');
            console.log(`   Error: ${result.error}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Запускаем тест
testEmail();
