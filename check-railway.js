#!/usr/bin/env node

// Диагностика Railway развертывания
import https from 'https';

const RAILWAY_URL = 'https://callspace.railway.app';

console.log('🔍 Диагностика Railway развертывания...\n');

// Функция для проверки URL
function checkUrl(url, description) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ ${description}: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log(`   📄 Содержимое: ${data.substring(0, 100)}...`);
                }
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ ${description}: ${err.message}`);
            resolve({ status: 'ERROR', error: err.message });
        });
        
        req.setTimeout(5000, () => {
            console.log(`⏰ ${description}: Timeout`);
            req.destroy();
            resolve({ status: 'TIMEOUT' });
        });
    });
}

// Проверяем различные эндпоинты
async function diagnose() {
    console.log(`🌐 Проверяем: ${RAILWAY_URL}\n`);
    
    // Главная страница
    await checkUrl(RAILWAY_URL, 'Главная страница');
    
    // API эндпоинты
    await checkUrl(`${RAILWAY_URL}/api/server/info`, 'API Server Info');
    await checkUrl(`${RAILWAY_URL}/api/users`, 'API Users');
    
    // Статические файлы
    await checkUrl(`${RAILWAY_URL}/client/index.html`, 'Client Index');
    await checkUrl(`${RAILWAY_URL}/client/messenger.html`, 'Messenger Page');
    await checkUrl(`${RAILWAY_URL}/client/admin.html`, 'Admin Page');
    
    console.log('\n📋 Результат диагностики:');
    console.log('❌ Если все эндпоинты возвращают ошибки:');
    console.log('   1. Приложение не развернуто на Railway');
    console.log('   2. Проверьте Railway dashboard');
    console.log('   3. Убедитесь, что проект "callspace" существует');
    console.log('   4. Проверьте статус развертывания');
    
    console.log('\n✅ Если некоторые эндпоинты работают:');
    console.log('   1. Приложение частично развернуто');
    console.log('   2. Проверьте логи развертывания');
    console.log('   3. Убедитесь, что все файлы загружены');
}

diagnose().catch(console.error);
