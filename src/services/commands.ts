import type { Domain, SimulationParameters } from "../types";

export type AssistantCommand =
  | { type: "simulation"; domain: Domain; parameters: Partial<SimulationParameters>; run: boolean }
  | { type: "navigate"; page: string }
  | { type: "project"; project: string }
  | { type: "summary" }
  | { type: "reminder"; title: string; time: string }
  | { type: "diagnose" }
  | { type: "explain" }
  | { type: "unknown" };

const numberAfter = (text: string, words: string[]) => {
  const expression = new RegExp(`(?:${words.join("|")})[^0-9]*(\\d{1,4})`, "i");
  const match = text.match(expression);
  return match ? Number(match[1]) : undefined;
};

export function parseAssistantCommand(input: string, currentDomain: Domain): AssistantCommand {
  const text = input.toLocaleLowerCase("tr-TR");
  const domain: Domain = /software|yazılım|api|servis|database|veritaban/.test(text)
    ? "software"
    : /aerospace|havacılık|itki|thruster|propulsion|telemetri/.test(text)
      ? "aerospace"
      : /automotive|otomotiv|batarya|battery|vehicle|araç|adas/.test(text)
        ? "automotive"
        : currentDomain;

  const simulationLanguage = /simül|simulation|senaryo|scenario|test|dene|deney|what if|ne olur|modelle|analiz et/.test(text);
  const parameters: Partial<SimulationParameters> = {};
  const primary = numberAfter(text, ["sıcaklık", "temperature", "temp", "gecikme", "latency", "termal", "thermal", "batarya", "battery"]);
  const reliability = numberAfter(text, ["güvenilirlik", "reliability"]);
  const efficiency = numberAfter(text, ["soğutma", "cooling", "verimlilik", "efficiency", "cache", "önbellek", "basınç", "pressure"]);
  const load = numberAfter(text, ["hız", "speed", "yük", "load", "trafik", "traffic", "itki", "thrust"]);
  if (primary !== undefined) parameters.primary = primary;
  if (reliability !== undefined) parameters.reliability = reliability;
  if (efficiency !== undefined) parameters.efficiency = efficiency;
  if (load !== undefined) parameters.load = load;
  if (simulationLanguage || Object.keys(parameters).length) {
    return { type: "simulation", domain, parameters, run: /çalıştır|başlat|run|execute|uygula|dene|test/.test(text) };
  }

  const project = /field lab/.test(text) ? "Field Lab 02" : /autonomy|otonomi/.test(text) ? "Autonomy Pilot" : /northstar/.test(text) ? "Northstar Facility" : undefined;
  if (project && /geç|aç|switch|open|seç/.test(text)) return { type: "project", project };

  const navigation: Array<[RegExp, string]> = [
    [/proje|project/, "Projects"], [/hafıza|memory|geçmiş/, "Memory"], [/hatırlatıcı|reminder/, "Reminders"],
    [/aktivite|activity|olay akışı/, "Activity"], [/profil|profile/, "Profile"], [/ayar|setting/, "Settings"],
    [/ajan|agent|ai ekibi/, "AI Workforce"], [/genel bakış|overview|dünya/, "Overview"],
  ];
  const destination = navigation.find(([pattern]) => pattern.test(text));
  if (destination && /git|geç|aç|göster|open|show|go/.test(text)) return { type: "navigate", page: destination[1] };

  if (/görev|task|özet|summary|bugün ne/.test(text)) return { type: "summary" };
  if (/sorun|problem|hata|arıza|anomali|risk|kontrol et|incele|diagnos|issue|fault|check/.test(text)) return { type: "diagnose" };
  if (/hatırlat|remind/.test(text)) {
    const time = text.match(/(?:saat\s*)?(\d{1,2}[:.]\d{2})/)?.[1]?.replace(".", ":") || "10:00";
    const title = input.replace(/bana|beni|hatırlat|remind me|yarın|tomorrow|saat\s*\d{1,2}[:.]\d{2}/gi, "").trim() || "Yeni görev";
    return { type: "reminder", title, time };
  }
  if (/açıkla|anlat|neden|niçin|explain|why|detay/.test(text)) return { type: "explain" };
  return { type: "unknown" };
}
