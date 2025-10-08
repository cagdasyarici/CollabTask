// Jest test kurulum dosyası
import { config } from 'dotenv';

// Test ortamı için environment değişkenlerini yükle
config({ path: '.env.test' });

// Test veritabanı ayarları
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/collabtask_test_db?schema=public';

// Global test timeout
jest.setTimeout(10000);

// Console.log'ları test sırasında sustur (isteğe bağlı)
if (process.env.SILENT_TESTS === 'true') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };
} 