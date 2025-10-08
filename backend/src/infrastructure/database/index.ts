// Veritabanı bağlantısı ve konfigürasyonu
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}

export interface DatabaseConnection {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
}

// Placeholder - İleride MongoDB/PostgreSQL implementasyonu eklenecek
export class DatabaseManager implements DatabaseConnection {
    private connected = false;

    async connect(): Promise<void> {
        console.log('Veritabanına bağlanılıyor...');
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        console.log('Veritabanı bağlantısı kapatılıyor...');
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected;
    }
} 