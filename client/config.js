// Конфигурация для разных окружений
const CONFIG = {
    development: {
        // WebSocket на том же порту что и HTTP (для ngrok)
        WS_URL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
        STUN_SERVERS: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302'
        ]
    },
    
    production: {
        // WebSocket на том же порту что и HTTP
        WS_URL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
        STUN_SERVERS: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302'
        ],
        // Добавьте TURN серверы для продакшена
        TURN_SERVERS: [
            // {
            //     urls: 'turn:your-turn-server.com:3478',
            //     username: 'username',
            //     credential: 'password'
            // }
        ]
    }
};

// Автоопределение окружения
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const CURRENT_CONFIG = CONFIG[ENV];

console.log(`🔧 Environment: ${ENV}`);
console.log(`🔌 WebSocket URL: ${CURRENT_CONFIG.WS_URL}`);
