// Конфигурация для развертывания CallSpace

export const DEPLOYMENT_CONFIG = {
    // Основные настройки
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        environment: process.env.NODE_ENV || 'development'
    },
    
    // Настройки для разных провайдеров
    providers: {
        // Heroku
        heroku: {
            port: process.env.PORT,
            host: '0.0.0.0',
            publicUrl: process.env.HEROKU_APP_NAME ? 
                `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : null
        },
        
        // Railway
        railway: {
            port: process.env.PORT,
            host: '0.0.0.0',
            publicUrl: process.env.RAILWAY_PUBLIC_DOMAIN ? 
                `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null
        },
        
        // Vercel
        vercel: {
            port: process.env.PORT || 3000,
            host: '0.0.0.0',
            publicUrl: process.env.VERCEL_URL ? 
                `https://${process.env.VERCEL_URL}` : null
        },
        
        // Render
        render: {
            port: process.env.PORT,
            host: '0.0.0.0',
            publicUrl: process.env.RENDER_EXTERNAL_URL
        },
        
        // DigitalOcean App Platform
        digitalocean: {
            port: process.env.PORT,
            host: '0.0.0.0',
            publicUrl: process.env.DO_APP_URL
        },
        
        // AWS Elastic Beanstalk
        aws: {
            port: process.env.PORT || 8080,
            host: '0.0.0.0',
            publicUrl: process.env.AWS_EB_URL
        }
    },
    
    // Настройки WebRTC для публичного доступа
    webrtc: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ],
        // TURN серверы для лучшей совместимости (требуют настройки)
        turnServers: process.env.TURN_SERVERS ? 
            JSON.parse(process.env.TURN_SERVERS) : []
    },
    
    // Настройки безопасности
    security: {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 минут
            max: 100 // максимум 100 запросов с одного IP
        }
    },
    
    // Настройки логирования
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty'
    }
};

// Определяем провайдера по переменным окружения
export function detectProvider() {
    if (process.env.HEROKU_APP_NAME) return 'heroku';
    if (process.env.RAILWAY_PUBLIC_DOMAIN) return 'railway';
    if (process.env.VERCEL_URL) return 'vercel';
    if (process.env.RENDER_EXTERNAL_URL) return 'render';
    if (process.env.DO_APP_URL) return 'digitalocean';
    if (process.env.AWS_EB_URL) return 'aws';
    return 'local';
}

// Получаем конфигурацию для текущего провайдера
export function getConfig() {
    const provider = detectProvider();
    const baseConfig = DEPLOYMENT_CONFIG.server;
    const providerConfig = DEPLOYMENT_CONFIG.providers[provider] || {};
    
    return {
        ...baseConfig,
        ...providerConfig,
        provider,
        webrtc: DEPLOYMENT_CONFIG.webrtc,
        security: DEPLOYMENT_CONFIG.security,
        logging: DEPLOYMENT_CONFIG.logging
    };
}
