# AI Physical World Operating System

Bu proje, Figma Make içinde çalışan React + Vite + Tailwind CSS ile oluşturulmuş bir demo uygulamasıdır. Hızlı prototip ve etkileşimli bileşen geliştirmeye yöneliktir.

## Öne çıkanlar
- React 19 + Vite 8 ile hızlı geliştirme deneyimi
- Tailwind CSS v4 ile utility-first stillendirme
- Figma Make entegrasyonu için ön yapılandırılmış proje

## Gereksinimler
- Node.js (LTS önerilir)
- `npm` veya `pnpm`

> Bu depo Figma Make ortamında çalışacak şekilde yapılandırılmıştır; geliştirme sunucusu varsayılan olarak `PORT=8443` üzerinde çalışıyor olabilir.

## Hızlı başlatma
Aşağıdaki komutlardan birini kullanın:

```bash
# bağımlılıkları yükle
npm install
# veya pnpm kullanıyorsanız
pnpm install

# geliştirme sunucusunu başlat
npm run dev
# veya pnpm
pnpm dev
```

Sunucu çalışırken önizleme panelinden veya yerel URL üzerinden uygulamayı görebilirsiniz.

## Üretim için derleme
```bash
npm run build
# veya pnpm
pnpm build

# derlemeyi yerel olarak önizlemek için
npm run preview
# veya pnpm
pnpm preview
```

## Proje yapısı (seçmeler)
- `src/main.tsx` — Uygulama giriş noktası
- `src/App.tsx` — Ana bileşen
- `src/index.css` — Tailwind ve global stiller
- `src/components/` — UI bileşenleri
- `vite.config.ts` — Vite + Tailwind + Figma Make yapılandırması
- `package.json` — Kullanılabilir npm script'leri
- `AGENTS.md` — Projeyle ilgili notlar ve geliştirme bilgileri

Daha ayrıntılı yapı için klasörleri inceleyin.

## Bilinen komutlar (package.json)
- `dev` — Geliştirme sunucusunu çalıştırır
- `build` — Üretim derlemesi üretir
- `preview` — Üretim derlemesini yerel olarak sunar

## Katkıda bulunma
- Yeni özellikler veya hata düzeltmeleri için pull request açın.
- Küçük değişiklikler için önce issue açıp tartışabilirsiniz.

## Lisans
Bu depoda lisans belirtilmemiştir — kullanmadan önce lisans ekleyin veya proje sahibine danışın.

## İletişim
Sorular veya öneriler için proje sahibine issue açabilirsiniz.
