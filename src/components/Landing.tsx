import { Icon } from "./Icon";
import { WorldMap } from "./WorldMap";
import type { Language } from "../App";

export function Landing({ onEnter, language, onLanguageChange }: { onEnter: () => void; language: Language; onLanguageChange: (language: Language) => void }) {
  const scrollToSystem = () => document.getElementById("system")?.scrollIntoView({ behavior: "smooth" });
  const tr = language === "tr";
  const loop = tr ? [
    ["01","Gözlemle","Fiziksel sinyaller ortak bağlama dönüşür."],["02","Anla","Ajanlar örüntüleri ve anlamı birleştirir."],
    ["03","Hatırla","Her karar dayanağıyla birlikte kalır."],["04","Simüle et","Sonuçlar eylemden önce incelenir."],
    ["05","İletişim kur","İnsanlar ve ajanlar açıkça hizalanır."],["06","Doğrula","Kanıt ve belirsizlik görünür kalır."],
    ["07","Harekete geç","Onaylı kararlar dünyaya uygulanır."],["08","Öğren","Sonuçlar bir sonraki kararı iyileştirir."],
  ] : [
    ["01","Observe","Physical signals become shared context."],["02","Understand","Agents connect patterns and meaning."],
    ["03","Remember","Every decision remains grounded."],["04","Simulate","Consequences are explored before action."],
    ["05","Communicate","Humans and agents align clearly."],["06","Verify","Evidence and uncertainty stay visible."],
    ["07","Act","Approved decisions enter the world."],["08","Learn","Outcomes improve what comes next."],
  ];

  return (
    <main className="landing">
      <nav className="landing-nav">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="brand-mark"><i /><i /><i /></span>
          <strong>WORLD</strong><span>OS</span>
        </button>
        <div className="nav-links">
          <button onClick={scrollToSystem}>{tr ? "Sistem" : "System"}</button>
          <button onClick={scrollToSystem}>{tr ? "Prensipler" : "Principles"}</button>
          <div className="language-toggle"><button className={tr ? "active" : ""} onClick={() => onLanguageChange("tr")}>TR</button><span>/</span><button className={!tr ? "active" : ""} onClick={() => onLanguageChange("en")}>EN</button></div>
          <button className="nav-enter" onClick={onEnter}>{tr ? "Çalışma Alanına Gir" : "Enter Workspace"} <Icon name="arrow" size={15} /></button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> {tr ? "AI FİZİKSEL DÜNYA İŞLETİM SİSTEMİ" : "AI PHYSICAL WORLD OPERATING SYSTEM"}</div>
          <h1>{tr ? <>Harekete geçmeden <em>önce</em><br />dünyayı anlayan AI.</> : <>AI that understands<br />the world <em>before</em> it acts.</>}</h1>
          <p>{tr ? "İnsanların, AI ajanlarının, fiziksel sistemlerin ve simülasyonların birlikte çalıştığı yaşayan bir çalışma alanı." : "A living workspace where humans, AI agents, physical systems and simulations work together."}</p>
          <div className="hero-actions">
            <button className="button primary" onClick={onEnter}>{tr ? "Çalışma Alanına Gir" : "Enter Workspace"} <Icon name="arrow" size={17} /></button>
            <button className="button secondary" onClick={scrollToSystem}>{tr ? "Sistemi Keşfet" : "Explore the System"}</button>
          </div>
          <div className="hero-proof">
            <div><strong>24</strong><span>{tr ? "Canlı sensör" : "Live sensors"}</span></div>
            <div><strong>8</strong><span>{tr ? "AI ajanı" : "AI agents"}</span></div>
            <div><strong>92</strong><span>{tr ? "Gerçeklik skoru" : "Reality score"}</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline">
            <span>{tr ? "CANLI DÜNYA / NORTHSTAR" : "LIVE WORLD / NORTHSTAR"}</span>
            <span><i className="status-dot" /> {tr ? "OPERASYONEL" : "OPERATIONAL"}</span>
          </div>
          <WorldMap compact language={language} />
          <div className="visual-caption">
            <span><b>14:42:08</b> {tr ? "Dünya durumu senkronize" : "World state synchronized"}</span>
            <span>{tr ? "2.4sn gecikme" : "2.4s latency"}</span>
          </div>
        </div>
      </section>

      <section className="system-intro" id="system">
        <div className="chapter-label">{tr ? "SİSTEM" : "THE SYSTEM"}</div>
        <div>
          <h2>{tr ? <>Anlama ve eylem arasında<br />kesintisiz bir döngü.</> : <>One continuous loop between<br />understanding and action.</>}</h2>
          <p>{tr ? "WORLD OS, insanların ve akıllı sistemlerin aynı gerçekliği algılamasına, sonuçları değerlendirmesine ve güvenle hareket etmesine yardımcı olur." : "WORLD OS helps people and intelligent systems perceive the same reality, reason about consequences, and act with confidence."}</p>
        </div>
      </section>

      <section className="system-loop">
        {loop.map(([number, title, description], index) => (
          <article className="loop-step" key={title}>
            <div className="loop-number">{number}</div>
            <div className="loop-glyph">
              <span className={`glyph glyph-${index + 1}`} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="landing-callout">
        <span className="eyebrow">{tr ? "ORTAK OPERASYONEL HAFIZA" : "A SHARED OPERATIONAL MEMORY"}</span>
        <h2>{tr ? <>Dünya değişir.<br />Anlayışın onunla birlikte değişir.</> : <>The world changes.<br />Your understanding changes with it.</>}</h2>
        <p>{tr ? "Aradaki insan bağlamını kaybetmeden gerçeklikten kanıta, simülasyona ve koordineli eyleme ilerle." : "Move from live reality to evidence, simulation and coordinated action—without losing the human context in between."}</p>
        <button className="button light" onClick={onEnter}>{tr ? "WORLD OS'u Deneyimle" : "Experience WORLD OS"} <Icon name="arrow" size={17} /></button>
        <div className="architecture">
          {(tr ? ["DÜNYA","HAFIZA","AJANLAR","SİMÜLASYON","EYLEM"] : ["WORLD", "MEMORY", "AGENTS", "SIMULATION", "ACTION"]).map((item, i) => (
            <div key={item}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item}</strong>{i < 4 && <Icon name="arrow" size={16} />}</div>
          ))}
        </div>
      </section>
      <footer className="landing-footer"><span>WORLD OS</span><span>{tr ? "Gözlemle. Anla. Hatırla. Simüle et. Doğrula. Harekete geç. Öğren." : "Observe. Understand. Remember. Simulate. Verify. Act. Learn."}</span><span>© 2025</span></footer>
    </main>
  );
}
