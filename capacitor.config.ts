import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.ff.callspace',
  appName: 'CallSpace',
  webDir: 'client',
  bundledWebRuntime: false,
  server: {
    // Оставляем пустым для продакшн: грузим локально из папки client
    // Для отладки против удалённого окружения можно раскомментировать:
    // url: 'https://ff.ru',
    // cleartext: false,
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
