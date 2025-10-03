// PM2 конфигурация для продакшена
module.exports = {
  apps: [{
    name: 'webrtc-video-calls',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      WS_PORT: 8080
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      WS_PORT: 8080
    }
  }]
};
