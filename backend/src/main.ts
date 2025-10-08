// collabtask-api main entry point
import { App } from './app';

async function main(): Promise<void> {
    console.log('🚀 ColabTask API başlatılıyor...');

    const app = new App();
    const port = parseInt(process.env.PORT || '3000', 10);

    // Graceful shutdown için signal handler'ları
    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM alındı, uygulama kapatılıyor...');
        await app.shutdown();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('🛑 SIGINT alındı, uygulama kapatılıyor...');
        await app.shutdown();
        process.exit(0);
    });

    try {
        await app.start(port);
    } catch (error) {
        console.error('❌ Uygulama başlatılırken hata oluştu:', error);
        process.exit(1);
    }
}

// Uygulamayı başlat
main().catch((error) => {
    console.error('❌ Ana fonksiyon hatası:', error);
    process.exit(1);
}); 