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
| Veritabanı | TBD                 |
| Gerçek Zamanlı | TBD (WebSocket / SSE) |
| Auth      | TBD                  |

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

## Açık Kararlar (TBD)

- Veritabanı: PostgreSQL mu? MySQL mi?
- Auth provider: kendi mi, OAuth (Google) mi?
- Deploy: Docker + VPS mi, cloud (AWS/GCP) mi?
- Gerçek zamanlı: WebSocket (STOMP) mi, SSE mi?

---

## Klasör Yapısı (Planlanan)

```
retroBoard/
├── backend/        # Java Spring Boot
├── frontend/       # React + Vite
├── mobile/         # Flutter
└── docs/           # API dokümantasyonu
```
