// Users Signup Integration Tests
import request from 'supertest';
import { App } from '../../../../app';
import { prisma } from '../../../../infrastructure/database/prisma.client';

describe('POST /api/users/signup', () => {
    let app: App;
    let server: any;

    beforeAll(async () => {
        // Test uygulamasını başlat
        app = new App();
        server = app.getApp();

        // Test veritabanını temizle
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        // Test sonrası temizlik
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Her test öncesi kullanıcı tablosunu temizle
        await prisma.user.deleteMany({});
    });

    describe('Başarılı kayıt', () => {
        it('geçerli verilerle kullanıcı oluşturmalı', async () => {
            const userData = {
                name: 'Ahmet Yılmaz',
                email: 'ahmet@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(201);

            // Response kontrolü
            expect(response.body).toMatchObject({
                success: true,
                message: 'Kullanıcı başarıyla oluşturuldu'
            });

            expect(response.body.data).toMatchObject({
                email: 'ahmet@example.com',
                firstName: 'Ahmet',
                lastName: 'Yılmaz',
                isActive: true
            });

            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.createdAt).toBeDefined();
            expect(response.body.data.updatedAt).toBeDefined();

            // Veritabanında kullanıcının oluştuğunu kontrol et
            const dbUser = await prisma.user.findUnique({
                where: { email: 'ahmet@example.com' }
            });

            expect(dbUser).toBeTruthy();
            expect(dbUser?.name).toBe('Ahmet Yılmaz');
            expect(dbUser?.email).toBe('ahmet@example.com');
            expect(dbUser?.passwordHash).toBeDefined();
            expect(dbUser?.passwordHash).not.toBe('password123'); // Hash'lenmiş olmalı
        });

        it('tek isimle kullanıcı oluşturmalı', async () => {
            const userData = {
                name: 'Mehmet',
                email: 'mehmet@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(201);

            expect(response.body.data).toMatchObject({
                firstName: 'Mehmet',
                lastName: ''
            });
        });

        it('çoklu isimle kullanıcı oluşturmalı', async () => {
            const userData = {
                name: 'Ali Veli Kara',
                email: 'ali@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(201);

            expect(response.body.data).toMatchObject({
                firstName: 'Ali',
                lastName: 'Veli Kara'
            });
        });
    });

    describe('Validasyon hataları', () => {
        it('eksik name ile 400 döndürmeli', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Name, email ve password alanları gereklidir'
            });
        });

        it('eksik email ile 400 döndürmeli', async () => {
            const userData = {
                name: 'Test User',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Name, email ve password alanları gereklidir'
            });
        });

        it('eksik password ile 400 döndürmeli', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Name, email ve password alanları gereklidir'
            });
        });

        it('çok kısa isim ile 400 döndürmeli', async () => {
            const userData = {
                name: 'A',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'İsim en az 2 karakter olmalıdır'
            });
        });

        it('geçersiz email ile 400 döndürmeli', async () => {
            const userData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Geçersiz email formatı'
            });
        });

        it('çok kısa şifre ile 400 döndürmeli', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: '123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Şifre en az 6 karakter olmalıdır'
            });
        });
    });

    describe('İş kuralı hataları', () => {
        it('mevcut email ile 400 döndürmeli', async () => {
            // İlk kullanıcıyı oluştur
            const firstUser = {
                name: 'İlk Kullanıcı',
                email: 'existing@example.com',
                password: 'password123'
            };

            await request(server)
                .post('/api/users/signup')
                .send(firstUser)
                .expect(201);

            // Aynı email ile ikinci kullanıcı oluşturmaya çalış
            const duplicateUser = {
                name: 'İkinci Kullanıcı',
                email: 'existing@example.com',
                password: 'different123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(duplicateUser)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Bu email adresi zaten kullanılıyor'
            });

            // Veritabanında sadece bir kullanıcı olduğunu kontrol et
            const userCount = await prisma.user.count({
                where: { email: 'existing@example.com' }
            });
            expect(userCount).toBe(1);
        });
    });

    describe('Güvenlik', () => {
        it('şifreyi response\'da döndürmemeli', async () => {
            const userData = {
                name: 'Security Test',
                email: 'security@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(201);

            // Response'da şifre olmamalı
            expect(response.body.data.password).toBeUndefined();
            expect(response.body.data.passwordHash).toBeUndefined();
        });

        it('şifreyi hash\'leyerek veritabanına kaydetmeli', async () => {
            const userData = {
                name: 'Hash Test',
                email: 'hash@example.com',
                password: 'password123'
            };

            await request(server)
                .post('/api/users/signup')
                .send(userData)
                .expect(201);

            // Veritabanında şifrenin hash'lenmiş olduğunu kontrol et
            const dbUser = await prisma.user.findUnique({
                where: { email: 'hash@example.com' }
            });

            expect(dbUser?.passwordHash).toBeDefined();
            expect(dbUser?.passwordHash).not.toBe('password123');
            expect(dbUser?.passwordHash.length).toBeGreaterThan(20); // bcrypt hash uzunluğu
        });
    });
}); 