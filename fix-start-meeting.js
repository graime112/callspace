#!/usr/bin/env node

// Скрипт для принудительного исправления кнопки Start Meeting
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Исправляем кнопку Start Meeting...');

// 1. Исправляем home-app.js
const homeAppPath = join(__dirname, 'client', 'home-app.js');
let homeAppContent = fs.readFileSync(homeAppPath, 'utf8');

// Добавляем принудительное исправление URL
const fixUrlCode = `
    // Принудительное исправление URL для Railway
    function forceHTTPS(url) {
        if (!url) return url;
        return url.replace(/^http:\/\//, 'https://');
    }
`;

// Вставляем функцию в начало файла
if (!homeAppContent.includes('forceHTTPS')) {
    homeAppContent = fixUrlCode + homeAppContent;
}

// Исправляем showMeetingModal
homeAppContent = homeAppContent.replace(
    /const httpsUrl = meetingData\.meetingUrl\.replace\('http:\/\/', 'https:\/\/'\);/,
    'const httpsUrl = forceHTTPS(meetingData.meetingUrl);'
);

// Исправляем startMeeting
homeAppContent = homeAppContent.replace(
    /const httpsUrl = this\.currentMeetingData\.meetingUrl\.replace\('http:\/\/', 'https:\/\/'\);/,
    'const httpsUrl = forceHTTPS(this.currentMeetingData.meetingUrl);'
);

fs.writeFileSync(homeAppPath, homeAppContent);
console.log('✅ home-app.js исправлен');

// 2. Исправляем meeting-app.js
const meetingAppPath = join(__dirname, 'client', 'meeting-app.js');
let meetingAppContent = fs.readFileSync(meetingAppPath, 'utf8');

// Добавляем принудительное исправление URL
if (!meetingAppContent.includes('forceHTTPS')) {
    meetingAppContent = fixUrlCode + meetingAppContent;
}

// Исправляем getShareLink
meetingAppContent = meetingAppContent.replace(
    /const origin = window\.location\.origin\.replace\('http:\/\/', 'https:\/\/'\);/,
    'const origin = forceHTTPS(window.location.origin);'
);

fs.writeFileSync(meetingAppPath, meetingAppContent);
console.log('✅ meeting-app.js исправлен');

// 3. Обновляем версии файлов
const indexPath = join(__dirname, 'client', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Обновляем версии
const newVersion = Date.now();
indexContent = indexContent.replace(/v=\d+/g, `v=${newVersion}`);

fs.writeFileSync(indexPath, indexContent);
console.log('✅ index.html обновлен с версией', newVersion);

console.log('🎉 Все исправления применены!');
console.log('📱 Обновите страницу в браузере (Ctrl+F5)');
