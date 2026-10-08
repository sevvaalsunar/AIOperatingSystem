import type { Language } from "./App";

const dictionaries = {
  tr: {
    common: {
      cancel: "İptal", save: "Kaydet", delete: "Sil", compare: "Karşılaştır", preview: "Önizle",
      assign: "Ata", close: "Kapat", source: "Kaynak", status: "Durum", available: "Uygun",
      simulation: "SİMÜLASYON", demoData: "DEMO VERİSİ", prototype: "Prototip simülasyon modeli",
    },
    flow: {
      title: "AI operasyon akışı", subtitle: "Olayın sistem boyunca nasıl ilerlediğini izle",
      world: "Dünya Asistanı", analysis: "Analiz Asistanı", simulation: "Simülasyon Asistanı",
      safety: "Güvenlik Asistanı", engineer: "Mühendis",
      waiting: "Bekliyor", collecting: "Veri topluyor", analyzing: "Analiz ediyor",
      running: "3 senaryo çalıştırıyor", evaluating: "Riski değerlendiriyor", approval: "Onay gerekli",
      completed: "Tamamlandı", paused: "Duraklatıldı",
    },
    sim: {
      eyebrow: "ETKİLEŞİMLİ MÜHENDİSLİK ORTAMI", title: "Operasyon simülasyonu",
      subtitle: "Parametreleri değiştir, deterministik sonuçları karşılaştır ve kararı kaydet.",
      sourceMode: "Veri kaynağı", simulatedSource: "Simülasyon motoru", liveSource: "Canlı MQTT / REST",
      liveDisconnected: "Canlı bağlayıcı yapılandırılmadı", configureConnector: "Bağlayıcı Ayarları",
      connect: "Demo MQTT köprüsüne bağlan", disconnect: "Bağlantıyı kes", liveConnected: "DEMO MQTT KÖPRÜSÜ / Bağlı",
      automotive: "Otomotiv", aerospace: "Havacılık", software: "Yazılım",
      start: "Operasyon senaryosunu başlat", pause: "Duraklat", resume: "Devam et",
      run: "Simülasyonu çalıştır", running: "Simülasyon çalışıyor…", runAgain: "Yeniden çalıştır",
      modify: "Parametreleri değiştir", saveScenario: "Senaryoyu kaydet", deleteRun: "Koşuyu sil",
      compareRuns: "Sonuçları karşılaştır", approval: "Mühendis onayı iste", evidence: "Kanıtı görüntüle",
      temperature: "Batarya sıcaklığı", reliability: "Sensör güvenilirliği",
      cooling: "Soğutma verimliliği", speed: "Araç hızı",
      latency: "API gecikmesi", dbLoad: "Veritabanı yükü", cacheHit: "Önbellek isabeti", traffic: "İstek trafiği",
      thermal: "Termal durum", vibration: "Titreşim", pressure: "Basınç", thrust: "İtki yükü",
      sourceBattery: "SIMULATION / Battery Sensor 07", sourceApi: "SIMULATION / Gateway Monitor",
      sourcePropulsion: "SIMULATION / Propulsion Telemetry",
      recommendation: "Simüle edilen koşullarda en yüksek risk hücre dengesizliği senaryosunda. Devam etmeden önce hücre düzeyi veriyi incelemeni öneriyorum.",
      softwareRecommendation: "Gecikme, son dağıtım ve veritabanı yüküyle ilişkili görünüyor. Geri alma işleminden önce sorgu planını doğrulamanı öneriyorum.",
      aerospaceRecommendation: "Termal ve titreşim örüntüsü birlikte yükseliyor. Fiziksel neden kesinleşmeden itki yükünü azaltıp telemetriyi doğrulamanı öneriyorum.",
      saved: "Senaryo kalıcı çalışma hafızasına kaydedildi.", deleted: "Simülasyon koşusu silindi.",
      noRuns: "Bu proje için henüz kayıtlı simülasyon yok.", firstRun: "İlk simülasyonu çalıştır",
    },
    engineer: {
      choose: "AI Mühendisini Seç", subtitle: "Uzmanlıkları karşılaştır ve çalışma alanına en uygun asistanı ata.",
      capability: "Yetenek", software: "Yazılım Mühendisliği", aerospace: "Havacılık",
      automotive: "Otomotiv", simulation: "Simülasyon", research: "Araştırma", voice: "Ses",
      proactive: "Proaktif Mod", high: "Yüksek", medium: "Orta", low: "Düşük", veryHigh: "Çok yüksek", yes: "Var",
      confirmTitle: "Yeni AI Mühendisi atansın mı?", current: "Mevcut", next: "Yeni",
      confirmBody: "Mevcut görüşme arşivlenecek ve yeni bir asistan oturumu başlayacak.",
      assigned: "{name} artık aktif AI Mühendisin.", archived: "Önceki asistan oturumu Hafıza bölümüne arşivlendi.",
      specialization: "Uzmanlıklar", style: "İletişim stili", capabilities: "Yetenekler",
    },
  },
  en: {
    common: {
      cancel: "Cancel", save: "Save", delete: "Delete", compare: "Compare", preview: "Preview",
      assign: "Assign", close: "Close", source: "Source", status: "Status", available: "Available",
      simulation: "SIMULATION", demoData: "DEMO DATA", prototype: "Prototype simulation model",
    },
    flow: {
      title: "AI operational flow", subtitle: "Follow the event as it moves through the system",
      world: "World Agent", analysis: "Analysis Agent", simulation: "Simulation Agent",
      safety: "Safety Agent", engineer: "Engineer",
      waiting: "Waiting", collecting: "Collecting data", analyzing: "Analyzing",
      running: "Running 3 scenarios", evaluating: "Evaluating risk", approval: "Approval required",
      completed: "Completed", paused: "Paused",
    },
    sim: {
      eyebrow: "INTERACTIVE ENGINEERING ENVIRONMENT", title: "Operational simulation",
      subtitle: "Modify parameters, compare deterministic outcomes, and retain the decision.",
      sourceMode: "Data source", simulatedSource: "Simulation engine", liveSource: "Live MQTT / REST",
      liveDisconnected: "Live connector is not configured", configureConnector: "Connector settings",
      connect: "Connect demo MQTT bridge", disconnect: "Disconnect", liveConnected: "DEMO MQTT BRIDGE / Connected",
      automotive: "Automotive", aerospace: "Aerospace", software: "Software",
      start: "Start operational scenario", pause: "Pause", resume: "Resume",
      run: "Run simulation", running: "Running simulation…", runAgain: "Run again",
      modify: "Modify parameters", saveScenario: "Save scenario", deleteRun: "Delete run",
      compareRuns: "Compare results", approval: "Request engineer approval", evidence: "View evidence",
      temperature: "Battery temperature", reliability: "Sensor reliability",
      cooling: "Cooling efficiency", speed: "Vehicle speed",
      latency: "API latency", dbLoad: "Database load", cacheHit: "Cache hit rate", traffic: "Request traffic",
      thermal: "Thermal state", vibration: "Vibration", pressure: "Pressure", thrust: "Thrust load",
      sourceBattery: "SIMULATION / Battery Sensor 07", sourceApi: "SIMULATION / Gateway Monitor",
      sourcePropulsion: "SIMULATION / Propulsion Telemetry",
      recommendation: "Cell imbalance currently has the highest risk under the simulated conditions. I recommend reviewing cell-level data before continuing.",
      softwareRecommendation: "Latency appears correlated with the recent deployment and database load. I recommend verifying the query plan before rollback.",
      aerospaceRecommendation: "Thermal and vibration patterns are rising together. Reduce thrust load and verify telemetry before attributing a physical cause.",
      saved: "Scenario saved to persistent work memory.", deleted: "Simulation run deleted.",
      noRuns: "No simulations have been saved for this project yet.", firstRun: "Run first simulation",
    },
    engineer: {
      choose: "Choose Your AI Engineer", subtitle: "Compare specializations and assign the best fit for your workspace.",
      capability: "Capability", software: "Software Engineering", aerospace: "Aerospace",
      automotive: "Automotive", simulation: "Simulation", research: "Research", voice: "Voice",
      proactive: "Proactive Mode", high: "High", medium: "Medium", low: "Low", veryHigh: "Very high", yes: "Yes",
      confirmTitle: "Assign a new AI Engineer?", current: "Current", next: "New",
      confirmBody: "The current conversation will be archived and a clean assistant session will begin.",
      assigned: "{name} is now your active AI Engineer.", archived: "The previous assistant session was archived in Memory.",
      specialization: "Specializations", style: "Communication style", capabilities: "Capabilities",
    },
  },
} as const;

type NestedRecord = Record<string, string | NestedRecord>;

export function translate(language: Language, path: string, variables?: Record<string, string | number>): string {
  const result = path.split(".").reduce<string | NestedRecord | undefined>((value, key) => {
    if (!value || typeof value === "string") return undefined;
    return value[key];
  }, dictionaries[language] as unknown as NestedRecord);
  const fallback = path.split(".").reduce<string | NestedRecord | undefined>((value, key) => {
    if (!value || typeof value === "string") return undefined;
    return value[key];
  }, dictionaries.en as unknown as NestedRecord);
  const text = typeof result === "string" ? result : typeof fallback === "string" ? fallback : path;
  return Object.entries(variables || {}).reduce((output, [key, value]) => output.replace(`{${key}}`, String(value)), text);
}

export function createTranslator(language: Language) {
  return (path: string, variables?: Record<string, string | number>) => translate(language, path, variables);
}
