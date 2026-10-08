# 🌐 WORLD OS — AI Physical World Operating System

> **"AI gerçek dünyada harekete geçmeden önce, mümkün olduğunca önce sanal dünyada denemeli."**

WORLD OS; fiziksel sistemlerden gelen sinyalleri, proje bağlamını, geçmiş olayları, simülasyon sonuçlarını ve insan kararlarını tek bir operasyon ortamında bir araya getiren bir **AI Fiziksel Dünya İşletim Sistemi** mimarisidir.

Bu depo, WORLD OS konseptinin dinamik davranışlarını, simülasyon motorunu ve çoklu AI mühendis koordinasyonunu sergileyen **etkileşimli prototip/demo uygulamasını** içerir.

---

## 🔄 Temel İşleyiş Döngüsü

Sistem, karar süreçlerinde şeffaflık ve güvenlik sağlamak için şu operasyonel döngüyü izler:

`Observe` ➔ `Understand` ➔ `Simulate` ➔ `Verify` ➔ `Approve` ➔ `Act` ➔ `Learn`

* **Observe & Understand:** Sensör, telemetri ve çevresel veriler üzerinden dünyayı izler; anomalileri aktif mühendislik bağlamında değerlendirir.
* **Simulate & Verify:** Doğrudan aksiyon almak yerine deterministik *"what-if"* senaryoları çalıştırır ve risk seviyelerini ölçer.
* **Approve & Act:** Ajan adımları **AgentFlow** üzerinden izlenir. Kritik kararlar **insan onayı** olmadan uygulama aşamasına geçmez.
* **Learn:** Kararlar ve simülasyon sonuçları **World Memory** üzerinde saklanarak kurumsal bir hafızaya dönüştürülür.

---

## 🌟 Prototip Kapsamı ve Özellikler

- **Sektörel Simülasyon Modelleri:** Automotive, Aerospace ve Software alanlarına özgü simülasyon parametreleri.
- **Canlı Veri & Simülasyon Engine:** Kontrollü senaryolar koşturan Simülasyon Motoru ve canlı veri akışı için Demo MQTT Köprüsü.
- **Çoklu AI Mühendis Koordinasyonu:** Uzmanlık alanları ayrıştırılmış AI mühendisleri (AURA, NOVA, ORBIT, VECTOR).
- **Bağlamsal Asistan:** Doğal dil komutlarıyla simülasyon başlatma, sayfa yönlendirmeleri ve kalıcı oturum bağlamı.

---

## 💡 İlham Kaynakları ve Etik Bildirim (Attribution & Inspiration)

Bu proje, 2026 yılı yapay zekâ ve otonom sistemler ekosisteminde öne çıkan bazı yenilikçi yaklaşımlardan **etik biçimde ilham alarak** geliştirilmiştir. 

WORLD OS, aşağıdaki projelerin doğrudan bir kopyası olmayıp, bu çalışmaların ortaya koyduğu kavramsal fikirlerin kesişiminde **özgün bir karar, güvenlik ve işletim katmanı** sunmayı hedefler:

- 🔹 **Screenpipe:** AI ajanlarına kalıcı bağlam ve hafıza kazandırma yaklaşımı.
- 🔹 **Mireye:** Saha, çevre ve konum verilerini AI kararlarına dönüştürme altyapısı.
- 🔹 **Arga Labs:** AI ajanlarını gerçek sistem öncesi yüksek sadakatli sanal ortamlarda test etme yaklaşımı.
- 🔹 **Hoplite:** Çoklu ajanların ölçeklenebilir ve paralel çalıştırılması mimarisi.

*WORLD OS, bu bağımsız teknolojileri tek bir "Simulation-to-Real Safety Layer" ve "World Memory" mimarisi altında birleştiren özgün bir konsept çalışmasıdır.*

---

## 🙏 Teşekkür ve Akademik Katkı

Projenin problem tanımının netleştirilmesinde, teknoloji vizyonunun şekillenmesinde ve mimari kararların sorgulanmasında sunduğu değerli yönlendirmeleri, eleştirileri ve akademik bakış açısı için **Dr. Öğretim Üyesi Nurettin Şenyer'e** teşekkür ederiz.

---

## 🛠️ Teknik Kurulum ve Yerel Çalıştırma

Bu demo uygulaması React 19, Vite 8 ve Tailwind CSS v4 kullanılarak geliştirilmiştir ve Figma Make ortamıyla uyumlu çalışacak şekilde yapılandırılmıştır.

### Gereksinimler
- Node.js (LTS sürümü önerilir)
- `npm` veya `pnpm`

> **Not:** Geliştirme sunucusu varsayılan olarak `PORT=8443` üzerinde çalışacak şekilde yapılandırılmış olabilir.

### Hızlı Başlatma

```bash
# Bağımlılıkları yükleyin
npm install
# veya
pnpm install

# Geliştirme sunucusunu başlatın
npm run dev
# veya
pnpm dev