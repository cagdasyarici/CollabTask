# CollabTask - Proje Yönetimi & İş Birliği Platformu

<div align="center">

![CollabTask](https://img.shields.io/badge/CollabTask-v1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

TypeScript ile geliştirilmiş modern, full-stack proje yönetimi ve ekip iş birliği platformu.

[English](./README.md) | [Türkçe](#türkçe)

</div>

---

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Gereksinimler](#gereksinimler)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [Uygulamayı Çalıştırma](#uygulamayı-çalıştırma)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Test](#test)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## 🎯 Genel Bakış

CollabTask, iş akışlarını optimize etmek, ekip verimliliğini artırmak ve proje ilerlemesi hakkında gerçek zamanlı bilgiler sağlamak için tasarlanmış kapsamlı bir proje yönetimi ve ekip iş birliği platformudur. Modern web teknolojileri ile geliştirilmiş ve yazılım mimarisinde en iyi uygulamaları takip eder.

---

## ✨ Özellikler

### Proje Yönetimi
- 📊 **Proje Panosu** - Tüm projelerin gerçek zamanlı görünümü
- 📝 **Görev Yönetimi** - Görev oluşturma, atama ve takip
- 🎨 **Kanban Panosu** - Sürükle-bırak özellikli görsel görev yönetimi
- 📈 **İlerleme Takibi** - Proje ve görev tamamlanma izleme
- 🏷️ **Etiketler & Kategoriler** - Projeleri ve görevleri verimli organize etme

### Ekip İş Birliği
- 👥 **Kullanıcı Yönetimi** - Ekip üyelerini davet etme ve yönetme
- 🔐 **Rol Tabanlı Erişim Kontrolü** - Admin, Yönetici ve Üye rolleri
- 👨‍👩‍👧‍👦 **Takım Yönetimi** - Takım oluşturma ve organize etme
- 💬 **Aktivite Akışı** - Ekip aktivitelerinin gerçek zamanlı güncellemeleri
- 🔔 **Bildirimler** - Önemli olaylardan haberdar olma

### Gelişmiş Özellikler
- 🔍 **Gelişmiş Arama** - Projeleri, görevleri ve kullanıcıları hızlıca bulma
- 📊 **Analitik & Raporlar** - Detaylı bilgiler ve istatistikler
- ⏱️ **Zaman Takibi** - Görevlere harcanan zamanı izleme
- 📎 **Dosya Yönetimi** - Projelere ve görevlere dosya ekleme
- 🌓 **Modern Arayüz** - Temiz, responsive ve sezgisel kullanıcı arayüzü

---

## 🛠️ Teknoloji Yığını

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js 5.x
- **Dil:** TypeScript 5.x
- **Veritabanı:** PostgreSQL (Prisma ORM ile)
- **Kimlik Doğrulama:** JWT (JSON Web Tokens)
- **API Dokümantasyonu:** Swagger/OpenAPI
- **Test:** Jest

### Frontend
- **Framework:** React 19.1
- **Build Aracı:** Vite 7.x
- **Dil:** TypeScript 5.x
- **Stil:** Tailwind CSS
- **State Yönetimi:** Zustand
- **HTTP İstemcisi:** Axios
- **Yönlendirme:** React Router v7

### Paylaşılan
- **Core Paketi:** Paylaşılan tipler ve interface'ler
- **Monorepo Yapısı:** Net ayrım ile organize edilmiş kod tabanı

---

## 📁 Proje Yapısı

```
CHADOWA-S-CollabTask/
├── backend/                 # Backend API (Express.js)
│   ├── src/
│   │   ├── features/       # Özellik modülleri
│   │   │   ├── auth/       # Kimlik doğrulama
│   │   │   ├── users/      # Kullanıcı yönetimi
│   │   │   ├── projects/   # Proje yönetimi
│   │   │   ├── tasks/      # Görev yönetimi
│   │   │   ├── teams/      # Takım yönetimi
│   │   │   ├── notifications/
│   │   │   ├── activities/
│   │   │   ├── files/
│   │   │   └── search/
│   │   ├── core/           # Temel yardımcı araçlar
│   │   ├── infrastructure/ # Veritabanı & dış servisler
│   │   └── main.ts         # Uygulama giriş noktası
│   ├── prisma/             # Veritabanı şeması & migrasyonlar
│   └── package.json
│
├── collabtask-ui/          # Frontend Uygulaması (React)
│   ├── src/
│   │   ├── components/     # Yeniden kullanılabilir UI bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── services/       # API servisleri
│   │   ├── store/          # State yönetimi
│   │   ├── types/          # TypeScript tipleri
│   │   └── App.tsx         # Ana uygulama bileşeni
│   └── package.json
│
├── core/                   # Paylaşılan tipler & interface'ler
│   ├── src/
│   │   └── types/
│   │       ├── entities.ts # Entity tanımları
│   │       ├── enums.ts    # Paylaşılan enum'lar
│   │       └── common.ts   # Ortak tipler
│   └── package.json
│
└── package.json            # Root package.json
```

---

## 📋 Gereksinimler

Başlamadan önce, aşağıdakilerin yüklü olduğundan emin olun:

- **Node.js** (v20.x veya üzeri) - [İndir](https://nodejs.org/)
- **npm** (v10.x veya üzeri) - Node.js ile birlikte gelir
- **PostgreSQL** (v14 veya üzeri) - [İndir](https://www.postgresql.org/download/)
- **Git** - [İndir](https://git-scm.com/)

---

## 🚀 Kurulum

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/yourusername/CHADOWA-S-CollabTask.git
cd CHADOWA-S-CollabTask
```

### 2. Bağımlılıkları Yükleyin

Tüm paketler için bağımlılıkları yükleyin:

```bash
# Root bağımlılıklarını yükle
npm install

# Backend bağımlılıklarını yükle
cd backend
npm install

# Frontend bağımlılıklarını yükle
cd ../collabtask-ui
npm install

# Core paket bağımlılıklarını yükle
cd ../core
npm install
```

### 3. Core Paketini Derleyin

Core paketi hem frontend hem de backend tarafından kullanılan paylaşılan tipleri içerir:

```bash
cd core
npm run build
```

---

## ⚙️ Yapılandırma

### 1. Veritabanı Kurulumu

PostgreSQL veritabanı oluşturun:

```bash
# PostgreSQL'e giriş yapın
psql -U postgres

# Veritabanı oluşturun
CREATE DATABASE collabtask;

# PostgreSQL'den çıkın
\q
```

### 2. Backend Ortam Değişkenleri

`backend/` dizininde bir `.env` dosyası oluşturun:

```bash
cd backend
```

Aşağıdaki içerikle `.env` dosyası oluşturun:

```env
# Sunucu Yapılandırması
PORT=5000
NODE_ENV=development

# Veritabanı Yapılandırması
DATABASE_URL="postgresql://postgres:sifreniz@localhost:5432/collabtask"

# JWT Yapılandırması
JWT_SECRET=production_ortaminda_bunu_degistir_super_gizli_anahtar
JWT_EXPIRES_IN=7d

# CORS Yapılandırması
FRONTEND_URL=http://localhost:5173

# Opsiyonel: Redis (önbellekleme kullanıyorsanız)
REDIS_URL=redis://localhost:6379

# Opsiyonel: Kafka (event streaming kullanıyorsanız)
KAFKA_BROKERS=localhost:9092
```

**⚠️ Önemli:** `sifreniz` ve `production_ortaminda_bunu_degistir_super_gizli_anahtar` değerlerini kendi değerlerinizle değiştirin.

### 3. Veritabanı Migrasyonlarını Çalıştırın

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. Frontend Ortam Değişkenleri

`collabtask-ui/` dizininde bir `.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Uygulamayı Çalıştırma

### Geliştirme Modu

**Üç terminal penceresi**ne ihtiyacınız olacak:

#### Terminal 1: Backend Sunucusu

```bash
cd backend
npm run dev
```

Backend `http://localhost:5000` adresinde başlayacak

#### Terminal 2: Frontend Geliştirme Sunucusu

```bash
cd collabtask-ui
npm run dev
```

Frontend `http://localhost:5173` adresinde başlayacak

#### Terminal 3: Core Paketini İzle (Opsiyonel)

Core pakette değişiklik yapıyorsanız:

```bash
cd core
npm run build -- --watch
```

### Production Build

#### Backend'i Derle

```bash
cd backend
npm run build
npm start
```

#### Frontend'i Derle

```bash
cd collabtask-ui
npm run build
npm run preview
```

---

## 📚 API Dokümantasyonu

Backend çalışırken, Swagger API dokümantasyonuna şu adresten erişebilirsiniz:

```
http://localhost:5000/api-docs
```

### Ana API Endpoint'leri

#### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcıyı getir

#### Projeler
- `GET /api/projects` - Tüm projeleri getir
- `POST /api/projects` - Yeni proje oluştur
- `GET /api/projects/:id` - ID'ye göre proje getir
- `PUT /api/projects/:id` - Projeyi güncelle
- `DELETE /api/projects/:id` - Projeyi sil

#### Görevler
- `GET /api/tasks` - Tüm görevleri getir
- `POST /api/tasks` - Yeni görev oluştur
- `PUT /api/tasks/:id` - Görevi güncelle
- `DELETE /api/tasks/:id` - Görevi sil

#### Kullanıcılar
- `GET /api/users` - Tüm kullanıcıları getir
- `GET /api/users/me` - Mevcut kullanıcıyı getir
- `GET /api/users/me/stats` - Kullanıcı istatistiklerini getir
- `PUT /api/users/:id` - Kullanıcıyı güncelle
- `POST /api/users/invite` - Yeni kullanıcı davet et

---

## 🧪 Test

### Backend Testleri

```bash
cd backend

# Tüm testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch

# Coverage ile testleri çalıştır
npm run test:coverage

# Sadece unit testleri çalıştır
npm run test:unit
```

---

## 🔒 Varsayılan Kullanıcılar

Migrasyonları çalıştırdıktan sonra, manuel olarak bir admin kullanıcısı oluşturabilir veya kayıt endpoint'ini kullanabilirsiniz.

**Önerilen İlk Kullanıcı:**
- Email: `admin@collabtask.com`
- Şifre: `Admin123!` (ilk girişten sonra değiştirin)
- Rol: `ADMIN`

---

## 🌍 Tarayıcı Desteği

- Chrome (en son)
- Firefox (en son)
- Safari (en son)
- Edge (en son)

---

## 📝 Geliştirme İş Akışı

1. Özelliğiniz için yeni bir branch oluşturun
2. Uygun pakette değişikliklerinizi yapın
3. Core tipleri değiştiriyorsanız, core paketini yeniden derleyin
4. Değişikliklerinizi test edin
5. Pull request oluşturun

---

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Sorunları

Veritabanı bağlantı hataları alıyorsanız:

1. PostgreSQL'in çalıştığını doğrulayın
2. `.env` dosyasındaki veritabanı kimlik bilgilerini kontrol edin
3. Veritabanının mevcut olduğundan emin olun
4. Migrasyonları çalıştırın: `npx prisma migrate deploy`

### Port Zaten Kullanımda

5000 veya 5173 portu zaten kullanımdaysa:

1. Backend `.env` dosyasındaki portu değiştirin (PORT değişkeni)
2. Frontend API URL'ini buna göre güncelleyin
3. Sunucuları yeniden başlatın

### Core Paketi Bulunamadı

`collabtask-core` bulunamadı hatası alıyorsanız:

1. Core paketini derleyin: `cd core && npm run build`
2. Backend ve frontend'te bağımlılıkları yeniden yükleyin
3. Geliştirme sunucularını yeniden başlatın

---

## 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen Pull Request göndermekten çekinmeyin.

1. Repository'yi fork edin
2. Feature branch'inizi oluşturun (`git checkout -b feature/HarikaBirOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Branch'inize push edin (`git push origin feature/HarikaBirOzellik`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje ISC Lisansı altında lisanslanmıştır.

---

## 👨‍💻 Yazar

**CHADOWA-S Geliştirme Ekibi**

---

## 🙏 Teşekkürler

- Harika framework için Express.js ekibine
- Güçlü UI kütüphanesi için React ekibine
- Mükemmel ORM için Prisma ekibine
- Tüm açık kaynak katkıda bulunanlara

---

<div align="center">

CHADOWA-S Ekibi tarafından ❤️ ile yapıldı

</div>

