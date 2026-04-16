# RetroBoard — Requirements

## Proje Özeti

Yazılım ekipleri için sprint retrospektif toplantılarını dijitalleştiren,
gerçek zamanlı ve çok platformlu bir board uygulaması.

---

## Teknoloji Stack

| Katman    | Teknoloji            |
|-----------|----------------------|
| Backend   | Java 21 + Spring Boot 3 |
| Frontend  | React (Vite) + TypeScript |
| Mobile    | Flutter              |
| Veritabanı | PostgreSQL           |
| Gerçek Zamanlı | Spring WebSocket + STOMP |
| Auth      | JWT (kendi sistemi)  |
| CI/CD     | GitHub Actions       |

---

## Temel Özellikler (MVP)

### Board
- [ ] Board oluşturma (sprint adı, tarih)
- [ ] Board listeleme / geçmiş boardlar
- [ ] Board silme / arşivleme

### Kolonlar
- [ ] Sabit 3 kolon: **Went Well**, **To Improve**, **Action Items**
- [ ] Özel kolon ekleme (opsiyonel)

### Kartlar
- [ ] Kart ekleme (metin)
- [ ] Kart düzenleme
- [ ] Kart silme
- [ ] Karta yorum ekleme (opsiyonel)

### Oylama
- [ ] Karta oy verme (👍)
- [ ] Oy sayısına göre sıralama

### Kullanıcı / Takım
- [ ] Kullanıcı kaydı / girişi
- [ ] Takım oluşturma
- [ ] Takıma üye davet etme

### Gerçek Zamanlı
- [ ] Aynı anda birden fazla kullanıcı aynı boardda çalışabilir
- [ ] Kart ekleme/silme anlık yansır

---

## Platformlar

- **Web** — React (masaüstü + mobil tarayıcı)
- **Mobil** — Flutter (iOS + Android)

---

## API

- REST API (Spring Boot)
- WebSocket (gerçek zamanlı sync)
- JWT tabanlı authentication

---

## Kararlaştırılan Teknik Seçimler

| Karar | Seçim |
|-------|-------|
| Veritabanı | PostgreSQL |
| Auth | JWT (kendi sistemi, Spring Security) |
| Gerçek Zamanlı | Spring WebSocket + STOMP |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

---

## Klasör Yapısı (Planlanan)

```
retroBoard/
├── backend/            # Java 21 + Spring Boot 3
│   └── src/
├── frontend/           # React + Vite + TypeScript
│   └── src/
├── mobile/             # Flutter
│   └── lib/
├── docs/               # API dokümantasyonu
├── .github/
│   └── workflows/      # GitHub Actions CI/CD
├── docker-compose.yml  # Lokal geliştirme ortamı
└── REQUIREMENTS.md
```
