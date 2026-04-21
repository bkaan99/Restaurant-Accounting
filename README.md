# Restaurant Takip Sistemi

Bu proje restoranlar icin basit bir web tabanli takip panelidir.

## Ozellikler

- Rol bazli giris (admin, manager, staff)
- Hizli siparis olusturma ve satis gecmisi
- Gider/malzeme alimi takibi
- Dashboard uzerinden satis-gider analizi
- Supabase baglantisi icin hazir altyapi

## Kurulum

1. Bagimliliklari yukleyin:

```bash
npm install
```

2. Ortam degiskenlerini tanimlayin:

```bash
# .env.local dosyasina asagidaki degerleri ekleyin
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Uygulamayi baslatin:

```bash
npm run dev
```

4. Tarayicidan acin:

`http://localhost:3000`

## Demo Giris Bilgileri

- admin / 123456
- manager / 123456
- staff / 123456

## Supabase Notu

Supabase bilgileri tanimli degilse uygulama demo veri ile calisir.

## Supabase Baslangic Kurulumu

1. Supabase'de yeni bir proje olusturun.
2. `supabase/schema.sql` dosyasini Supabase SQL Editor'e yapistirip calistirin.
3. Proje URL ve anon key bilgilerini `.env.local` dosyasina ekleyin.
4. Uygulamayi yeniden baslatin (`npm run dev`).

Bu adimlardan sonra menu, satis ve gider kayitlari Supabase uzerinden okunur ve kaydedilir.
