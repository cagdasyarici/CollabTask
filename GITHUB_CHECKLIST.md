# 📋 GitHub Push Checklist / GitHub'a Gönderme Kontrol Listesi

Bu listeyi GitHub'a göndermeden önce kontrol edin.
Check this list before pushing to GitHub.

## ✅ Kod Kontrolü / Code Check

- [ ] Tüm değişiklikler commit edildi / All changes are committed
- [ ] Test edildi ve çalışıyor / Tested and working
- [ ] Linter hataları yok / No linter errors
- [ ] Console.log ve debug kodları temizlendi / Debug code removed
- [ ] Gereksiz yorumlar kaldırıldı / Unnecessary comments removed

## 🔐 Güvenlik / Security

- [ ] `.env` dosyaları `.gitignore`'da / `.env` files in `.gitignore`
- [ ] Hassas bilgiler kodda yok / No sensitive data in code
- [ ] API anahtarları ortam değişkenlerinde / API keys in environment variables
- [ ] JWT_SECRET güçlü ve rastgele / JWT_SECRET is strong and random
- [ ] Veritabanı şifreleri güvenli / Database passwords are secure

## 📄 Dokümantasyon / Documentation

- [ ] README.md güncel / README.md is up to date
- [ ] API dokümantasyonu güncel / API documentation updated
- [ ] CHANGELOG.md güncellendi / CHANGELOG.md updated
- [ ] Yorum satırları yeterli / Sufficient comments
- [ ] .env.example dosyaları eksiksiz / .env.example files complete

## 🗂️ Dosya Yapısı / File Structure

- [ ] Gereksiz dosyalar silindi / Unnecessary files removed
- [ ] `node_modules/` gitignore'da / `node_modules/` in gitignore
- [ ] `dist/` klasörleri gitignore'da / `dist/` folders in gitignore
- [ ] Geçici dosyalar temizlendi / Temporary files cleaned

## 📦 Bağımlılıklar / Dependencies

- [ ] `package.json` güncel / `package.json` updated
- [ ] `package-lock.json` mevcut / `package-lock.json` exists
- [ ] Kullanılmayan bağımlılıklar kaldırıldı / Unused dependencies removed
- [ ] Güvenlik açıkları kontrol edildi (`npm audit`) / Security checked

## 🧪 Test / Testing

- [ ] Backend testleri geçiyor / Backend tests passing
- [ ] Manuel test yapıldı / Manual testing completed
- [ ] Temel özellikler çalışıyor / Core features working
- [ ] Hata durumları test edildi / Error cases tested

## 🎨 Frontend Kontrolü / Frontend Check

- [ ] Responsive tasarım çalışıyor / Responsive design works
- [ ] Tüm sayfalar yükleniyor / All pages load
- [ ] Formlar doğru çalışıyor / Forms work correctly
- [ ] API bağlantıları çalışıyor / API connections work

## 🔧 Backend Kontrolü / Backend Check

- [ ] Sunucu başlıyor / Server starts
- [ ] API endpoint'leri çalışıyor / API endpoints work
- [ ] Veritabanı bağlantısı var / Database connection works
- [ ] Migration'lar uygulandı / Migrations applied
- [ ] Swagger dokümantasyonu çalışıyor / Swagger docs work

## 📝 Git Kontrolü / Git Check

- [ ] Anlamlı commit mesajları / Meaningful commit messages
- [ ] `.gitignore` dosyası eksiksiz / Complete `.gitignore`
- [ ] Branch adı doğru / Correct branch name
- [ ] Merge conflict'leri çözüldü / Merge conflicts resolved

## 🌐 GitHub Özellikleri / GitHub Features

- [ ] README.md yeterince detaylı / README.md is detailed enough
- [ ] LICENSE dosyası eklendi / LICENSE file added
- [ ] CONTRIBUTING.md eklendi / CONTRIBUTING.md added
- [ ] Issue template'leri eklendi / Issue templates added
- [ ] PR template eklendi / PR template added
- [ ] .github klasörü hazır / .github folder ready

## 🚀 Son Kontroller / Final Checks

- [ ] Proje adı ve açıklama doğru / Project name and description correct
- [ ] Repository public/private ayarı doğru / Repository visibility correct
- [ ] GitHub'da görünmesini istemediğiniz dosyalar gitignore'da / Unwanted files in gitignore
- [ ] Remote repository URL'i doğru / Correct remote repository URL

## 📤 Push Komutları / Push Commands

### İlk Push / Initial Push

```bash
# Git başlat (eğer başlatılmadıysa)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: CollabTask v1.0.0"

# Remote repository ekle (GitHub'da oluşturduktan sonra)
git remote add origin https://github.com/yourusername/CHADOWA-S-CollabTask.git

# Main branch'e push
git branch -M main
git push -u origin main
```

### Sonraki Push'lar / Subsequent Pushes

```bash
# Değişiklikleri ekle
git add .

# Commit et
git commit -m "feat: açıklama buraya"

# Push et
git push origin main
```

## 🎯 Push Sonrası / After Push

- [ ] GitHub repository'de dosyalar görünüyor / Files visible on GitHub
- [ ] README doğru görünüyor / README displays correctly
- [ ] Issues açılabilir / Issues can be created
- [ ] Wiki eklenebilir (opsiyonel) / Wiki can be added (optional)
- [ ] GitHub Actions ayarlanabilir (opsiyonel) / GitHub Actions can be set up (optional)

## 💡 İpuçları / Tips

### Repository Ayarları
1. GitHub'da repository oluştururken "Add a README file" seçmeyin (zaten var)
2. .gitignore seçmeyin (zaten var)
3. License seçebilirsiniz veya LICENSE dosyası zaten var

### Güzel Görünüm İçin
- Shields.io badge'leri ekleyin
- Proje ekran görüntüleri ekleyin
- GIF demo ekleyin
- Topics ekleyin (typescript, react, express, etc.)

### Güvenlik
```bash
# Hassas bilgi kontrolü
git log --all --full-history --source --branches --tags -- "*.env"

# Eğer .env commit edilmişse, history'den temizleyin
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## ✨ Hepsi Tamam mı? GitHub'a Gönder!

```bash
git push origin main
```

🎉 Tebrikler! Projeniz artık GitHub'da!

## 📍 Sıradaki Adımlar

1. **Repository Settings:**
   - Description ekleyin
   - Website URL ekleyin
   - Topics ekleyin

2. **GitHub Pages (Opsiyonel):**
   - Settings > Pages
   - Frontend'i statik olarak yayınlayın

3. **Collaborators:**
   - Takım üyelerini ekleyin

4. **Branch Protection:**
   - main branch'i koruyun
   - PR zorunlu hale getirin

---

**İyi şanslar! / Good luck! 🚀**

