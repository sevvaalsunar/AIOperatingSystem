import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Language, Theme } from "../App";
import { activities as seedActivities, agents, initialReminders, memories as seedMemories, projects, type Reminder } from "../data";
import { Icon } from "./Icon";
import { WorldMap } from "./WorldMap";
import { EngineerComparison, engineerProfiles, type Engineer } from "./EngineerComparison";
import { SimulationLab } from "./SimulationLab";
import type { Domain, SimulationParameters } from "../types";
import { worldEvents } from "../services/events";
import { settingsStore } from "../services/persistence";
import { parseAssistantCommand } from "../services/commands";

type VoiceState = "idle" | "listening" | "processing" | "speaking";
type Toast = { id: number; message: string; tone?: "success" | "error" };
type Activity = { actor: string; action: string; time: string; tone: string };
type Memory = { time: string; title: string; detail: string; type: string };
type Profile = {
  name: string; surname: string; title: string; department: string; organization: string;
  expertise: string; interests: string; timezone: string; notifications: boolean; engineer: string;
  communication: string; interaction: string; voice: string; domain: string; photo?: string;
  voicePreferences?: Record<string,string>;
};

const labels = {
  tr: {
    Overview: "Genel Bakış", Projects: "Projeler", People: "Ekip", "AI Workforce": "AI Ekibi",
    Memory: "Hafıza", Simulations: "Simülasyon", Activity: "Aktiviteler", Reminders: "Hatırlatıcılar",
    Profile: "Profil", Settings: "Ayarlar",
  },
  en: {
    Overview: "Overview", Projects: "Projects", People: "People", "AI Workforce": "AI Workforce",
    Memory: "Memory", Simulations: "Simulation", Activity: "Activity", Reminders: "Reminders",
    Profile: "Profile", Settings: "Settings",
  },
};

const navItems = [
  ["Overview", "overview"], ["Projects", "projects"], ["People", "people"], ["AI Workforce", "agents"],
  ["Memory", "memory"], ["Simulations", "simulation"], ["Reminders", "clock"], ["Activity", "activity"],
  ["Profile", "people"], ["Settings", "settings"],
];

const engineers = [
  { name: "AURA", specialty: "Systems Engineering", style: "Calm and analytical", capabilities: "Research · Planning · Memory", status: "Active" },
  { name: "NOVA", specialty: "Software Engineering", style: "Direct and pragmatic", capabilities: "Code · Architecture · Research", status: "Available" },
  { name: "ORBIT", specialty: "Aerospace Engineering", style: "Methodical and cautious", capabilities: "Telemetry · Simulation · Safety", status: "Available" },
  { name: "VECTOR", specialty: "Automotive Systems", style: "Technical and proactive", capabilities: "ADAS · Battery · Diagnostics", status: "Available" },
];

const today = new Date().toISOString().slice(0, 10);
const readLocal = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
};
const profileInitials = (profile: Pick<Profile, "name" | "surname">) =>
  [profile.name, profile.surname].map(value => value.trim().charAt(0)).join("").toLocaleUpperCase() || "—";

function Toasts({ toasts }: { toasts: Toast[] }) {
  return <div className="toast-stack" aria-live="polite">{toasts.map(toast => <div className={`toast ${toast.tone || "success"}`} key={toast.id}><Icon name={toast.tone === "error" ? "activity" : "shield"} size={16}/>{toast.message}</div>)}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="product-modal" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" size={17}/></button></header>{children}</section></div>;
}

function Header({ page, project, profile, language, theme, onLanguage, onTheme, onSearch, onProfile, onBack, onForward, canBack, canForward }: {
  page: string; language: Language; theme: Theme; onLanguage: (value: Language) => void;
  onTheme: (value: Theme) => void; onSearch: () => void; onProfile: () => void; project:string; profile: Profile;
  onBack:()=>void; onForward:()=>void; canBack:boolean; canForward:boolean;
}) {
  const tr = language === "tr";
  const cycleTheme = () => onTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  return <header className="workspace-header">
    <div><span className="workspace-kicker">{project.toUpperCase()} · {tr ? "DEMO ORTAMI" : "DEMO ENVIRONMENT"}</span><h1>{labels[language][page as keyof typeof labels.tr]}</h1></div>
    <div className="header-tools">
      <div className="history-controls">
        <button className="icon-button" onClick={onBack} disabled={!canBack} aria-label={tr?"Geri git":"Go back"}><Icon name="chevron" size={16}/></button>
        <button className="icon-button forward" onClick={onForward} disabled={!canForward} aria-label={tr?"İleri git":"Go forward"}><Icon name="chevron" size={16}/></button>
      </div>
      <button className="search-trigger" onClick={onSearch}><Icon name="search" size={17}/><span>{tr ? "Her şeyi ara" : "Search anything"}</span><kbd>⌘ K</kbd></button>
      <div className="language-toggle compact"><button className={tr ? "active" : ""} onClick={() => onLanguage("tr")}>TR</button><span>/</span><button className={!tr ? "active" : ""} onClick={() => onLanguage("en")}>EN</button></div>
      <button className="icon-button" onClick={cycleTheme} aria-label={tr ? "Temayı değiştir" : "Change theme"}>{theme === "dark" ? "☾" : theme === "light" ? "☀" : "◐"}</button>
      <button className="avatar" onClick={onProfile} aria-label={tr ? `${profile.name} ${profile.surname} profilini aç` : `Open ${profile.name} ${profile.surname}'s profile`}>
        {profile.photo ? <img src={profile.photo} alt=""/> : profileInitials(profile)}
      </button>
    </div>
  </header>;
}

function Overview({ language, project, reminders, demoMode, onDemo, onNavigate, onOpenAI, onScenario }: {
  language: Language; reminders: Reminder[]; demoMode: boolean; onDemo: () => void;
  onNavigate: (page: string) => void; onOpenAI: () => void; project:string;
  onScenario:(domain:Domain,parameters:Partial<SimulationParameters>)=>void;
}) {
  const tr = language === "tr";
  const todayReminders = reminders.filter(item => item.date === today && item.status !== "Completed").slice(0, 3);
  const scenario=project==="Field Lab 02"
    ? {domain:"aerospace" as Domain,title:tr?"İtki alt sistemi telemetri anomalisi":"Propulsion subsystem telemetry anomaly",metrics:tr?"Termal +%7.2 · Titreşim +%11.6 · Basınç normal":"Thermal +7.2% · Vibration +11.6% · Pressure normal",parameters:{primary:76,reliability:91,efficiency:68,load:78}}
    : project==="Autonomy Pilot"
      ? {domain:"automotive" as Domain,title:tr?"Araç 12 ADAS sensör tutarsızlığı":"Vehicle 12 ADAS sensor inconsistency",metrics:tr?"Güvenilirlik %82 · Hız %64 · Sensör farkı %9.8":"Reliability 82% · Speed 64% · Sensor delta 9.8%",parameters:{primary:41,reliability:82,efficiency:74,load:64}}
      : {domain:"automotive" as Domain,title:tr?"Araç 07 batarya termal anomalisi":"Vehicle 07 battery thermal anomaly",metrics:tr?"Sıcaklık +%8.4 · Titreşim +%13.1 · Basınç normal":"Temperature +8.4% · Vibration +13.1% · Pressure normal",parameters:{primary:44,reliability:92,efficiency:58,load:72}};
  return <div className="overview-grid">
    <section className="world-panel panel">
      <div className="demo-banner"><span><i className="status-dot"/> {tr ? "DEMO ORTAMI — SİMÜLE EDİLMİŞ VERİ" : "DEMO ENVIRONMENT — SIMULATED DATA"}</span><label><input type="checkbox" checked={demoMode} onChange={onDemo}/>{tr ? "Demo Modu" : "Demo Mode"}</label></div>
      <div className="section-heading"><div><span className="eyebrow">{tr ? "DÜNYA DURUMU" : "WORLD STATUS"}</span><h2><i className="status-dot large"/> {tr ? "Operasyonel" : "Operational"}</h2></div><button className="outline-button" onClick={() => onNavigate("Activity")}><Icon name="clock" size={15}/>{tr ? "Akışı izle" : "View flow"}</button></div>
      <div className="metrics">{[["24",tr?"Sensör":"Sensors",tr?"çevrimiçi":"online"],["8",tr?"AI Ajanı":"AI Agents",tr?"aktif":"active"],["6",tr?"Ekip":"People",tr?"aktif":"active"],["3",tr?"Robot":"Robots",tr?"çevrimiçi":"online"],["1",tr?"Uyarı":"Alert",tr?"incelemede":"review"]].map(([value,label,detail])=><div key={label}><strong>{value}</strong><span>{label}<small>{detail}</small></span></div>)}</div>
      <WorldMap language={language}/>
    </section>
    <section className="activity-panel panel">
      <div className="section-heading compact"><div><span className="eyebrow">{tr ? "BUGÜN" : "TODAY"}</span><h2>{tr ? "Hatırlatıcılar" : "Reminders"}</h2></div><button className="text-button" onClick={() => onNavigate("Reminders")}>{tr ? "Tümünü gör" : "View all"} →</button></div>
      <div className="today-list">{todayReminders.length ? todayReminders.map(item => <button key={item.id} onClick={() => onNavigate("Reminders")}><time>{item.time}</time><span><strong>{item.title}</strong><small>{item.category}</small></span><i className={`priority ${item.priority.toLowerCase()}`}/></button>) : <p>{tr ? "Bugün için yaklaşan hatırlatıcı yok." : "No upcoming reminders today."}</p>}</div>
      <button className="ai-summary-card" onClick={onOpenAI}><span className="agent-orb"><i/></span><span><b>{tr ? "AI İş Arkadaşına Sor" : "Ask AI Workmate"}</b><small>{tr ? `${todayReminders.length} yaklaşan görevi özetle` : `Summarize ${todayReminders.length} upcoming tasks`}</small></span><Icon name="chevron" size={15}/></button>
      <div className="anomaly-card"><span className="eyebrow">{tr ? "AKTİF DEMO SENARYOSU" : "ACTIVE DEMO SCENARIO"} · {project}</span><h3>{scenario.title}</h3><p>{scenario.metrics}</p><button onClick={() => onScenario(scenario.domain,scenario.parameters)}>{tr ? "Önerilen ayarlarla incele" : "Review with suggested settings"} <Icon name="arrow" size={14}/></button></div>
    </section>
  </div>;
}

function RemindersPage({ language, reminders, onCreate, onUpdate, onDelete }: {
  language: Language; reminders: Reminder[]; onCreate: (reminder: Omit<Reminder,"id">) => void;
  onUpdate: (reminder: Reminder) => void; onDelete: (id: number) => void;
}) {
  const tr = language === "tr";
  const empty = { title: "", description: "", date: today, time: "10:00", priority: "Medium" as const, category: "Personal" as const, status: "Upcoming" as const };
  const [form, setForm] = useState<Omit<Reminder,"id">>(empty);
  const [editing, setEditing] = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    editing ? onUpdate({ ...form, id: editing }) : onCreate(form);
    setForm(empty); setEditing(null); setShowForm(false);
  };
  const edit = (item: Reminder) => { const { id, ...values } = item; setEditing(id); setForm(values); setShowForm(true); };
  return <section className="content-page">
    <div className="page-intro"><div><span className="eyebrow">{tr ? "KİŞİSEL ÇALIŞMA HAFIZASI" : "PERSONAL WORK MEMORY"}</span><h2>{tr ? "Hatırlatıcılar" : "Reminders"}</h2><p>{tr ? "Kişisel, proje ve mühendislik görevlerini tek yerde yönet." : "Manage personal, project and engineering tasks in one place."}</p></div><button className="button primary small-button" onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}><Icon name="plus" size={16}/>{tr ? "Yeni hatırlatıcı" : "New reminder"}</button></div>
    <div className="reminder-summary">{["Upcoming","Completed","Overdue"].map(status=><button key={status} onClick={() => document.getElementById(`reminder-${status}`)?.scrollIntoView({behavior:"smooth"})}><strong>{reminders.filter(item=>item.status===status).length}</strong><span>{tr ? ({Upcoming:"Yaklaşan",Completed:"Tamamlandı",Overdue:"Gecikmiş"} as Record<string,string>)[status] : status}</span></button>)}</div>
    <div className="reminder-list">{reminders.map(item=><article id={`reminder-${item.status}`} key={item.id} className={item.status.toLowerCase()}><button className={`check-button ${item.status==="Completed"?"checked":""}`} onClick={()=>onUpdate({...item,status:item.status==="Completed"?"Upcoming":"Completed"})} aria-label={tr?"Tamamlandı olarak işaretle":"Mark complete"}>{item.status==="Completed"&&"✓"}</button><div><span className="eyebrow">{item.category} · {item.priority}</span><h3>{item.title}</h3><p>{item.description}</p></div><time><strong>{item.time}</strong><span>{item.date}</span></time><div className="row-actions"><button className="icon-button small" onClick={()=>edit(item)} aria-label="Edit">✎</button><button className="icon-button small danger" onClick={()=>onDelete(item.id)} aria-label="Delete">×</button></div></article>)}</div>
    {showForm&&<Modal title={editing ? (tr?"Hatırlatıcıyı düzenle":"Edit reminder") : (tr?"Hatırlatıcı oluştur":"Create reminder")} onClose={()=>setShowForm(false)}><form className="form-grid" onSubmit={save}><label>{tr?"Başlık":"Title"}<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label><label className="span-two">{tr?"Açıklama":"Description"}<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>{tr?"Tarih":"Date"}<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>{tr?"Saat":"Time"}<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label><label>{tr?"Kategori":"Category"}<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as Reminder["category"]})}>{["Personal","Project","Engineering","AI","Meeting"].map(x=><option key={x}>{x}</option>)}</select></label><label>{tr?"Öncelik":"Priority"}<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Reminder["priority"]})}>{["High","Medium","Low"].map(x=><option key={x}>{x}</option>)}</select></label><footer><button type="button" className="outline-button" onClick={()=>setShowForm(false)}>{tr?"İptal":"Cancel"}</button><button className="button primary small-button">{tr?"Kaydet":"Save"}</button></footer></form></Modal>}
  </section>;
}

function SimulationPage({ language, onComplete }: { language: Language; onComplete: () => void }) {
  const tr = language === "tr";
  const [state,setState]=useState<"ready"|"running"|"complete"|"applied">("ready");
  const run=()=>{setState("running");window.setTimeout(()=>{setState("complete");onComplete()},1600)};
  return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"DEMO · SİMÜLE EDİLMİŞ TELEMETRİ":"DEMO · SIMULATED TELEMETRY"}</span><h2>{tr?"Batarya termal anomalisi":"Battery thermal anomaly"}</h2><p>{tr?"Araç 07 için sonuçları eylemden önce değerlendir.":"Evaluate consequences for Vehicle 07 before taking action."}</p></div></div>
    <div className="telemetry-strip">{[["Temperature","+8.4%","warning"],["Vibration","+13.1%","warning"],["Pressure",tr?"Normal":"Normal","good"],["Historical similarity","87%","good"]].map(([a,b,c])=><div key={a}><span>{a}</span><strong className={c}>{b}</strong></div>)}</div>
    <div className="scenario-prompt"><Icon name="spark" size={20}/><span>{tr?"Üç olası nedeni analiz et ve en güvenli tanı prosedürünü öner.":"Analyze three possible causes and recommend the safest diagnostic procedure."}</span><button disabled={state==="running"} onClick={run}>{state==="running"?(tr?"Çalışıyor…":"Running…"):(tr?"Simülasyonu çalıştır":"Run simulation")}</button></div>
    {state==="running"&&<div className="simulation-loading"><span/><strong>{tr?"Simulation Agent üç senaryo modelliyor…":"Simulation Agent is modeling three scenarios…"}</strong><small>{tr?"Safety Agent sonuçları doğrulayacak.":"Safety Agent will verify the results."}</small></div>}
    {(state==="complete"||state==="applied")&&<><div className="scenario-results">{[["01",tr?"Soğutma sistemi anomalisi":"Cooling system anomaly","48%"],["02",tr?"Mekanik titreşim":"Mechanical vibration","31%"],["03",tr?"Sensör arızası":"Sensor malfunction","21%"]].map((x,i)=><article className={i===0?"recommended":""} key={x[0]}><span>{x[0]}</span><div><h3>{x[1]}</h3><p>{i===0?(tr?"Termal yükseliş ve titreşim korelasyonu en güçlü açıklama.":"Thermal rise and vibration correlation provide the strongest explanation."):(tr?"Ek ölçüm ile doğrulama gerekli.":"Additional measurement is required.")}</p></div><strong>{x[2]}</strong></article>)}</div><div className="recommendation"><Icon name="shield" size={22}/><div><span className="eyebrow">WORLD AGENT · {tr?"ÖNERİ":"RECOMMENDATION"}</span><p>{tr?"Kesin neden için yeterli kanıt yok. Araç yükünü azaltın ve soğutma devresini fiziksel müdahaleden önce tanı modunda doğrulayın.":"There is not enough evidence to identify the exact cause. Reduce vehicle load and verify the cooling circuit in diagnostic mode before physical intervention."}</p></div>{state==="applied"?<b>✓ {tr?"Onaylandı":"Approved"}</b>:<button className="button primary small-button" onClick={()=>setState("applied")}>{tr?"Tanı prosedürünü onayla":"Approve diagnostic procedure"}</button>}</div></>}
  </section>;
}

function ProfilePage({ language, profile, onSave, onAssign, onLanguage }: { language: Language; profile: Profile; onSave: (profile: Profile) => void; onAssign: (engineer: string) => void; onLanguage: (language: Language) => void }) {
  const tr=language==="tr"; const [draft,setDraft]=useState(profile); const [selecting,setSelecting]=useState(false);
  useEffect(()=>setDraft(profile),[profile]);
  const engineer=engineerProfiles.find(item=>item.name===profile.engineer)||engineerProfiles[0];
  const selectPhoto=(file?:File)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>setDraft(value=>({...value,photo:String(reader.result)}));reader.readAsDataURL(file)};
  return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"KİŞİSEL ÇALIŞMA ORTAMI":"PERSONAL WORK ENVIRONMENT"}</span><h2>{tr?"Profil":"Profile"}</h2><p>YOU → YOUR AI ENGINEER → YOUR PROJECTS</p></div></div><div className="profile-layout"><form className="profile-card" onSubmit={e=>{e.preventDefault();onSave(draft)}}><div className="profile-photo">{draft.photo?<img src={draft.photo} alt="Profile"/>:<span>{profileInitials(draft)}</span>}<label>{tr?"Fotoğraf değiştir":"Change photo"}<input type="file" accept="image/*" onChange={e=>selectPhoto(e.target.files?.[0])}/></label></div><div className="form-grid"><label>{tr?"Ad":"Name"}<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>{tr?"Soyad":"Surname"}<input value={draft.surname} onChange={e=>setDraft({...draft,surname:e.target.value})}/></label><label>{tr?"Unvan":"Title"}<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label>{tr?"Departman":"Department"}<input value={draft.department} onChange={e=>setDraft({...draft,department:e.target.value})}/></label><label className="span-two">{tr?"Organizasyon":"Organization"}<input value={draft.organization} onChange={e=>setDraft({...draft,organization:e.target.value})}/></label><label>{tr?"Uzmanlık":"Expertise"}<input value={draft.expertise} onChange={e=>setDraft({...draft,expertise:e.target.value})}/></label><label>{tr?"İlgi alanları":"Interests"}<input value={draft.interests} onChange={e=>setDraft({...draft,interests:e.target.value})}/></label><label>{tr?"Saat dilimi":"Timezone"}<select value={draft.timezone} onChange={e=>setDraft({...draft,timezone:e.target.value})}><option>Europe/Istanbul</option><option>Europe/Berlin</option><option>America/New_York</option></select></label><label>{tr?"Tercih edilen dil":"Preferred language"}<select value={language} onChange={e=>onLanguage(e.target.value as Language)}><option value="tr">TR · Türkçe</option><option value="en">EN · English</option></select></label><label className="toggle-label"><input type="checkbox" checked={draft.notifications} onChange={e=>setDraft({...draft,notifications:e.target.checked})}/>{tr?"Bildirimler açık":"Notifications enabled"}</label></div><button className="button primary small-button">{tr?"Profili kaydet":"Save profile"}</button></form>
    <aside className="engineer-card"><span className="eyebrow">{tr?"AI MÜHENDİSİN":"YOUR AI ENGINEER"}</span><div className="engineer-portrait">{engineer.name.slice(0,2)}<i className="status-dot"/></div><h2>{engineer.name}</h2><p>{engineer.title[language]}</p><dl><div><dt>{tr?"Durum":"Status"}</dt><dd><i className="status-dot"/> {tr?"Aktif":"Active"}</dd></div><div><dt>{tr?"Uzmanlıklar":"Specializations"}</dt><dd>{engineer.specialties[language].join(" · ")}</dd></div><div><dt>{tr?"Ses":"Voice"}</dt><dd>{profile.voicePreferences?.[engineer.name] || engineer.voice}</dd></div><div><dt>{tr?"İletişim":"Communication"}</dt><dd>{profile.communication}</dd></div></dl><button className="outline-button" onClick={()=>setSelecting(true)}>{tr?"AI Mühendisini Değiştir":"Change AI Engineer"}</button></aside></div>
    {selecting&&<div className="modal-backdrop"><EngineerComparison language={language} current={profile.engineer} onCancel={()=>setSelecting(false)} onAssign={(engineer:Engineer)=>{onAssign(engineer.name);setSelecting(false)}}/></div>}
  </section>;
}

function SettingsPage({ language, theme, profile, demoMode, onLanguage, onTheme, onProfile, onDemo }: {
  language: Language; theme: Theme; profile: Profile; demoMode: boolean; onLanguage:(l:Language)=>void;
  onTheme:(t:Theme)=>void; onProfile:(p:Profile)=>void; onDemo:()=>void;
}) {
  const tr=language==="tr";
  return <section className="content-page settings-page"><div className="page-intro"><div><span className="eyebrow">{tr?"TERCİHLER VE ERİŞİM":"PREFERENCES & ACCESS"}</span><h2>{tr?"Ayarlar":"Settings"}</h2><p>{tr?"WORLD OS deneyimini çalışma biçimine göre ayarla.":"Adapt WORLD OS to the way you work."}</p></div></div>
    <section><h3>{tr?"Görünüm":"Appearance"}</h3><p>{tr?"Tüm çalışma alanında kullanılan tema.":"Theme used across the entire workspace."}</p><div className="choice-grid">{(["light","system","dark"] as Theme[]).map(item=><button className={theme===item?"active":""} onClick={()=>onTheme(item)} key={item}><span>{item==="light"?"☀":item==="dark"?"☾":"◐"}</span><b>{item[0].toUpperCase()+item.slice(1)}</b></button>)}</div></section>
    <section><h3>{tr?"Dil":"Language"}</h3><div className="segmented"><button className={language==="tr"?"active":""} onClick={()=>onLanguage("tr")}>TR · Türkçe</button><button className={language==="en"?"active":""} onClick={()=>onLanguage("en")}>EN · English</button></div></section>
    <section><h3>{tr?"AI Mühendis Tercihleri":"AI Engineer Preferences"}</h3><div className="form-grid"><label>{tr?"İletişim stili":"Communication style"}<select value={profile.communication} onChange={e=>onProfile({...profile,communication:e.target.value})}><option>Concise</option><option>Balanced</option><option>Detailed</option></select></label><label>{tr?"Etkileşim":"Interaction"}<select value={profile.interaction} onChange={e=>onProfile({...profile,interaction:e.target.value})}><option>Proactive</option><option>Balanced</option><option>Reactive</option></select></label><label>{profile.engineer} · {tr?"Ses":"Voice"}<select value={profile.voicePreferences?.[profile.engineer]||profile.voice} onChange={e=>onProfile({...profile,voice:e.target.value,voicePreferences:{...(profile.voicePreferences||{}),[profile.engineer]:e.target.value}})}>{engineerProfiles.map(item=><option key={item.name} value={item.voice}>{item.name} — {item.voice}</option>)}</select></label><label>{tr?"Alan":"Domain"}<select value={profile.domain} onChange={e=>onProfile({...profile,domain:e.target.value})}><option>Automotive</option><option>Aerospace</option><option>Software</option><option>General Engineering</option></select></label></div></section>
    <section className="demo-setting"><div><h3>{tr?"Demo Modu":"Demo Mode"}</h3><p>{tr?"Sunumlar için gerçekçi simüle edilmiş mühendislik verileri kullanır. Gerçek altyapı verisi değildir.":"Uses realistic simulated engineering data for presentations. This is not live infrastructure data."}</p></div><label className="switch"><input type="checkbox" checked={demoMode} onChange={onDemo}/><i/></label></section>
  </section>;
}

function DataPage({ page, language, memories, activities, onNavigate, onProjectSelect }: { page:string; language:Language; memories:Memory[]; activities:Activity[]; onNavigate:(p:string)=>void; onProjectSelect:(project:string)=>void }) {
  const tr=language==="tr";
  const [filter,setFilter]=useState("All");
  if(page==="Memory") return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"İZLENEBİLİR BAĞLAM":"TRACEABLE CONTEXT"}</span><h2>{tr?"İş Hafızası":"Work Memory"}</h2><p>{tr?"Gözlemler, kararlar ve sonuçlar.":"Observations, decisions and outcomes."}</p></div></div><div className="timeline">{memories.map((item,i)=><article className="timeline-event" key={`${item.time}-${i}`}><time>{item.time}</time><i className={i===0?"active":""}/><div><span>{item.type}</span><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div></section>;
  if(page==="Activity") return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"CANLI OPERASYONLAR":"LIVE OPERATIONS"}</span><h2>{tr?"Aktivite Akışı":"Activity Stream"}</h2><p>{tr?"İnsanlar, ajanlar ve fiziksel sistemlerden yapılandırılmış güncellemeler.":"Structured updates from people, agents and physical systems."}</p></div></div><div className="full-activity">{activities.map((item,i)=><button key={i} onClick={()=>onNavigate(item.actor.includes("Agent")?"AI Workforce":"Overview")}><span className={`activity-avatar ${item.tone}`}>{item.actor.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><div><strong>{item.actor}</strong><p>{item.action}</p></div><span className="event-tag">{i%2?"Result":"Action"}</span><time>{item.time}</time></button>)}</div></section>;
  if(page==="AI Workforce") return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"KOORDİNE ZEKA":"COORDINATED INTELLIGENCE"}</span><h2>{tr?"AI Ekibi":"AI Workforce"}</h2><p>{tr?"Açık görevler ve izinlerle çalışan uzman ajanlar.":"Specialized agents working with explicit roles and permissions."}</p></div></div><div className="table-shell">{agents.map(agent=><details className="agent-detail-row" key={agent.id}><summary><span className="agent-identity"><i>{agent.initials}</i><span><strong>{agent.name}</strong><small>{agent.specialization}</small></span></span><span>{agent.task}</span><span><i className={`status-dot ${agent.status.toLowerCase()}`}/>{agent.status}</span><b>{agent.reliability}%</b></summary><div><span>{tr?"Bağlantılar":"Connected"}: <b>{agent.connected.join(", ")}</b></span><span>{tr?"Hafıza olayları":"Memory events"}: <b>{agent.memories}</b></span><span>{tr?"İzin":"Permission"}: <b>Project · Read & recommend</b></span></div></details>)}</div></section>;
  if(page==="Projects") return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"OPERASYONEL ORTAMLAR":"OPERATIONAL ENVIRONMENTS"}</span><h2>{tr?"Projeler":"Projects"}</h2><p>{tr?"Her proje kendi küçük operasyonel dünyasıdır.":"Each project is its own operational world."}</p></div></div><div className="project-grid">{projects.map((project,i)=><button key={project.name} onClick={()=>{onProjectSelect(project.name);onNavigate("Overview")}}><div className={`project-visual project-${i}`}><span>{String(i+1).padStart(2,"0")}</span><i/><i/><i/></div><div><span className="eyebrow">{project.place}</span><h3>{project.name}</h3><p><i className="status-dot"/> {project.status}</p><footer><span>{project.people} people</span><span>{project.agents} agents</span><span>{project.sensors} sensors</span></footer></div></button>)}</div></section>;
  const people=[["SC","Sarah Chen","Operations lead"],["MK","Marcus Kim","Robotics engineer"],["AN","Amina Noor","Safety specialist"],["JL","Jonas Lind","Research lead"]];
  return <section className="content-page"><div className="page-intro"><div><span className="eyebrow">{tr?"İNSAN + ZEKA":"PEOPLE + INTELLIGENCE"}</span><h2>{tr?"Ekip":"People & Agents"}</h2><p>{tr?"Kimlik ve erişimi açık tek operasyon ortamı.":"One operational environment with clear identity and access."}</p></div><div className="segmented">{["All","People","AI Agents"].map(item=><button className={filter===item?"active":""} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div></div><div className="people-grid">{filter!=="AI Agents"&&people.map(person=><article key={person[1]}><i>{person[0]}</i><div><h3>{person[1]}</h3><span>{person[2]}</span><p><b className="status-dot"/> Northstar</p></div></article>)}{filter!=="People"&&agents.slice(0,4).map(agent=><article key={agent.id}><i>{agent.initials}</i><div><h3>{agent.name}</h3><span>{agent.specialization}</span><p><b className="status-dot"/> {agent.status}</p></div></article>)}</div></section>;
}

function SearchModal({ language, onClose, onNavigate }: { language:Language; onClose:()=>void; onNavigate:(page:string)=>void }) {
  const [query,setQuery]=useState(""); const tr=language==="tr";
  const items=[{title:tr?"Batarya termal anomalisi":"Battery thermal anomaly",page:"Simulations",type:"Simulation"},{title:tr?"Proje raporu hatırlatıcısı":"Project report reminder",page:"Reminders",type:"Reminder"},{title:"Vision Agent",page:"AI Workforce",type:"Agent"},{title:"Northstar Facility",page:"Projects",type:"Project"}].filter(item=>item.title.toLowerCase().includes(query.toLowerCase()));
  return <Modal title={tr?"Global arama":"Global search"} onClose={onClose}><div className="modal-search"><Icon name="search" size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr?"Kişiler, olaylar, sensörler, kararlar…":"People, events, sensors, decisions…"} /></div><div className="search-results">{items.map(item=><button key={item.title} onClick={()=>{onNavigate(item.page);onClose()}}><span>{item.type}</span><strong>{item.title}</strong><Icon name="arrow" size={15}/></button>)}{!items.length&&<p>{tr?"Eşleşen sonuç bulunamadı.":"No matching results found."}</p>}</div></Modal>;
}

function AgentPanel({ open, language, page, project, engineer, sessionId, onClose, onReminder, onNavigate, domain = "automotive", onSimulationCommand, onProjectChange }: {
  open:boolean; language:Language; page:string; engineer:string; onClose:()=>void;
  onReminder:(item:Omit<Reminder,"id">)=>void; onNavigate:(page:string)=>void;
  domain?: Domain; onSimulationCommand?: (domain: Domain, parameters: Partial<SimulationParameters>, run: boolean) => void; project:string;
  onProjectChange?:(project:string)=>void; sessionId:number;
}) {
  const tr=language==="tr"; const [voice,setVoice]=useState<VoiceState>("idle"); const [session,setSession]=useState(false);
  const chatKey=`chat.${engineer}.${sessionId}.${domain}.${project}`;
  const [message,setMessage]=useState(""); const [messages,setMessages]=useState<{from:"ai"|"user";text:string}[]>(()=>settingsStore.get(chatKey,[]));
  const recognition=useRef<any>(null); const silenceTimer=useRef<number|null>(null); const inactivityTimer=useRef<number|null>(null); const sessionRef=useRef(false);
  const contextualResponse=(text:string)=>{
    const command=parseAssistantCommand(text,domain);
    if(command.type==="summary"){
      return project==="Field Lab 02"
        ? (tr?"Field Lab 02 için bugün sensör kalibrasyonu, saha veri doğrulaması ve 16:00 güvenlik incelemesi var. Önce çevrimdışı Sensör 04'ü kontrol etmeni öneriyorum.":"For Field Lab 02, today's work includes sensor calibration, field-data validation, and a 16:00 safety review. I recommend checking offline Sensor 04 first.")
        : project==="Autonomy Pilot"
          ? (tr?"Autonomy Pilot için üç öncelik var: rota simülasyonu, ADAS tutarlılık testi ve insan onayı bekleyen güvenlik senaryosu. Önce güvenlik senaryosunu açıklayabilirim.":"Autonomy Pilot has three priorities: route simulation, ADAS consistency testing, and a safety scenario awaiting human approval. I can explain the safety scenario first.")
          : (tr?"Northstar Facility için batarya termal simülasyonu, Robot 03 rota doğrulaması ve proje raporu bekliyor. En yüksek teknik öncelik termal anomalinin Safety Agent tarafından doğrulanması.":"Northstar Facility has a battery thermal simulation, Robot 03 route validation, and a project report pending. The highest technical priority is Safety Agent verification of the thermal anomaly.");
    }
    if(command.type==="simulation"){
      onSimulationCommand?.(command.domain,command.parameters,command.run);
      const domainName=command.domain==="automotive"?(tr?"Otomotiv":"Automotive"):command.domain==="software"?(tr?"Yazılım":"Software"):(tr?"Havacılık":"Aerospace");
      const metric=command.parameters.primary||(command.domain==="software"?120:command.domain==="aerospace"?68:36);
      const peak=command.domain==="software"?Math.round(metric*1.46):Math.round(metric*1.32);
      const probability=Math.min(94,Math.round(42+metric*.72));
      const risk=probability>72?(tr?"yüksek":"high"):probability>48?(tr?"orta":"medium"):(tr?"düşük":"low");
      return tr?`${project} için ${domainName} bağlamına geçtim. ${Object.keys(command.parameters).length} parametreyi güncelledim${command.run?" ve simülasyonu başlatıyorum":"; simülasyon çalıştırılmaya hazır"}. Tahmini tepe değer ${peak}${command.domain==="software"?"ms":"°C"}, olasılık %${probability}, risk ${risk}.`:`For ${project}, I switched to ${domainName}. I updated ${Object.keys(command.parameters).length} parameters${command.run?" and started the simulation":"; the simulation is ready to run"}. Estimated peak is ${peak}${command.domain==="software"?"ms":"°C"}, probability ${probability}%, risk ${risk}.`;
    }
    if(command.type==="navigate"){onNavigate(command.page);return tr?`${labels.tr[command.page as keyof typeof labels.tr]} bölümünü açtım.`:`Opened ${command.page}.`}
    if(command.type==="project"){onProjectChange?.(command.project);return tr?`${command.project} proje bağlamına geçtim. Bu projenin görevlerini, hafızasını ve simülasyonlarını kullanacağım.`:`Switched to ${command.project}. I will use this project's tasks, memory, and simulations.`}
    if(command.type==="reminder"){
      onReminder({title:command.title,description:tr?`${project} için AI tarafından oluşturuldu`:`Created by AI for ${project}`,date:new Date(Date.now()+86400000).toISOString().slice(0,10),time:command.time,priority:"High",category:"Project",status:"Upcoming"});
      return tr?`Tamam. Yarın ${command.time} için “${command.title}” hatırlatıcısını oluşturdum.`:`Done. I created “${command.title}” for tomorrow at ${command.time}.`;
    }
    if(command.type==="diagnose"){
      if(domain==="software") return tr
        ? `${project} için olası sorunlar:\n\n1. API Gateway doygunluğu\nBelirti: Gecikme trafikle birlikte yükselir.\nÖrnek çözüm: Rate-limit değerlerini ve yatay ölçeklemeyi kontrol et.\n\n2. Veritabanı sorgu gerilemesi\nBelirti: Dağıtım sonrası sorgu süreleri artar.\nÖrnek çözüm: Query planını önceki sürümle karşılaştır; eksik indeksleri doğrula.\n\n3. Önbellek isabet oranı düşüşü\nBelirti: Veritabanı yükü ve API gecikmesi birlikte artar.\nÖrnek çözüm: TTL değişikliklerini incele ve kontrollü cache warm-up çalıştır.\n\n4. Harici servis veya ağ gecikmesi\nBelirti: Yalnızca belirli endpoint zincirleri yavaşlar.\nÖrnek çözüm: Distributed trace ile en yavaş downstream servisi belirle.\n\nÖnerim: Önce veritabanı yükü ile cache hit oranını karşılaştıran iki simülasyon çalıştıralım.`
        : `${project} possible issues:\n\n1. API Gateway saturation\nSignal: Latency rises with traffic.\nExample solution: Review rate limits and horizontal scaling.\n\n2. Database query regression\nSignal: Query time increases after deployment.\nExample solution: Compare query plans and verify missing indexes.\n\n3. Cache hit-rate degradation\nSignal: Database load and API latency rise together.\nExample solution: Review TTL changes and run a controlled cache warm-up.\n\n4. Downstream or network latency\nSignal: Only specific endpoint chains become slow.\nExample solution: Use distributed traces to isolate the slowest dependency.`;
      if(domain==="aerospace") return tr
        ? `${project} için olası sorunlar:\n\n1. Termal kontrol kapasitesi düşüşü\nÖrnek çözüm: İtki yükünü azaltıp soğutma çevrimini doğrula.\n\n2. Mekanik titreşim bağlantısı\nÖrnek çözüm: Frekans spektrumunu geçmiş testlerle karşılaştır.\n\n3. Basınç sensörü sapması\nÖrnek çözüm: Yedek sensör ve kalibrasyon verisini çapraz doğrula.\n\n4. Telemetri paket kaybı\nÖrnek çözüm: Ham veri sürekliliğini ve zaman damgalarını kontrol et.`
        : `${project} possible issues:\n\n1. Reduced thermal-control capacity — reduce thrust load and verify the cooling loop.\n\n2. Mechanical vibration coupling — compare the frequency spectrum with previous tests.\n\n3. Pressure sensor drift — cross-check redundant sensors and calibration data.\n\n4. Telemetry packet loss — verify raw-data continuity and timestamps.`;
      return tr
        ? `${project} için olası sorunlar:\n\n1. Soğutma sistemi verim kaybı\nÖrnek çözüm: Pompa akışı ve soğutucu devresini yük altında doğrula.\n\n2. Batarya hücre dengesizliği\nÖrnek çözüm: Hücre bazlı voltaj ve sıcaklık farklarını karşılaştır.\n\n3. Sensör kalibrasyon sapması\nÖrnek çözüm: Sensör 07 değerini yedek sensörle çapraz kontrol et.\n\n4. Yüksek araç yükü\nÖrnek çözüm: Aynı rotayı daha düşük hız ve yük ile yeniden simüle et.\n\nÖnerim: Soğutma verimini %60 ve araç yükünü %45 yaparak karşılaştırmalı bir koşu çalıştıralım.`
        : `${project} possible issues:\n\n1. Cooling-system efficiency loss — verify pump flow and coolant circulation under load.\n\n2. Battery-cell imbalance — compare cell-level voltage and temperature deltas.\n\n3. Sensor calibration drift — cross-check Sensor 07 with a redundant sensor.\n\n4. Excessive vehicle load — rerun the route with reduced speed and load.`;
    }
    if(command.type==="explain"||page==="Simulations") return domain==="software"?(tr?`${project} için API gecikmesi, veritabanı yükü ve önbellek isabetini birlikte inceliyorum. Bu değişkenleri istediğin değerlere getirip koşuları karşılaştırabilirim.`:`For ${project}, I am examining API latency, database load, and cache hit rate together. I can set them to your values and compare runs.`):domain==="aerospace"?(tr?`${project} için termal durum, titreşim, basınç ve itki yükünü birlikte inceliyorum. Alternatif koşulları modelleyebilirim.`:`For ${project}, I am examining thermal state, vibration, pressure, and thrust load together. I can model alternative conditions.`):(tr?`${project} için batarya sıcaklığı, sensör güvenilirliği, soğutma verimi ve araç yükünü birlikte inceliyorum.`:`For ${project}, I am examining battery temperature, sensor reliability, cooling efficiency, and vehicle load together.`);
    return tr?`İsteğini ${project} ve ${domain} bağlamında değerlendirdim. Proje değiştirebilir, bir bölümü açabilir, hatırlatıcı oluşturabilir veya verdiğin değerlerle simülasyon hazırlayabilirim.`:`I evaluated your request in the ${project} and ${domain} context. I can change projects, open a section, create a reminder, or prepare a simulation using your values.`;
  };
  const speak=(text:string)=>{
    if(!("speechSynthesis" in window)){setVoice("listening");return;}
    window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text); utterance.lang=tr?"tr-TR":"en-US"; utterance.rate=.96;
    utterance.onstart=()=>setVoice("speaking"); utterance.onend=()=>{if(sessionRef.current)startListening();else setVoice("idle")}; window.speechSynthesis.speak(utterance);
  };
  const process=(text:string)=>{setVoice("processing");setMessages(value=>[...value,{from:"user",text}]);window.setTimeout(()=>{const answer=contextualResponse(text);setMessages(value=>[...value,{from:"ai",text:answer}]);speak(answer)},900)};
  const startListening=()=>{
    if(!sessionRef.current)return; setVoice("listening"); if(silenceTimer.current)clearTimeout(silenceTimer.current);
    silenceTimer.current=window.setTimeout(()=>setVoice(current=>current==="listening"?"idle":current),7000);
    const Ctor=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(Ctor){try{recognition.current?.abort();const rec=new Ctor();recognition.current=rec;rec.lang=tr?"tr-TR":"en-US";rec.interimResults=false;rec.continuous=false;rec.onresult=(e:any)=>{const text=e.results[0][0].transcript;if(text.toLocaleLowerCase().includes("sesli görüşmeyi bitir"))endSession();else process(text)};rec.onerror=()=>setVoice("idle");rec.start()}catch{setVoice("idle")}}
    if(inactivityTimer.current)clearTimeout(inactivityTimer.current);inactivityTimer.current=window.setTimeout(endSession,60000);
  };
  const beginSession=()=>{sessionRef.current=true;setSession(true);window.setTimeout(startListening,0)};
  const endSession=()=>{sessionRef.current=false;setSession(false);setVoice("idle");recognition.current?.abort();window.speechSynthesis?.cancel();if(silenceTimer.current)clearTimeout(silenceTimer.current);if(inactivityTimer.current)clearTimeout(inactivityTimer.current)};
  const interrupt=()=>{window.speechSynthesis?.cancel();setVoice("listening");startListening()};
  useEffect(()=>()=>{recognition.current?.abort();window.speechSynthesis?.cancel()},[]);
  const submit=(event:FormEvent)=>{event.preventDefault();if(!message.trim())return;const text=message;setMessage("");setMessages(value=>[...value,{from:"user",text}]);window.setTimeout(()=>{const answer=contextualResponse(text);setMessages(value=>[...value,{from:"ai",text:answer}]);if(/simülasyon|simulation|denemek|test|görev|task|özet/i.test(text))speak(answer)},600)};
  useEffect(()=>settingsStore.set(chatKey,messages),[messages,chatKey]);
  const domainName=domain==="automotive"?(tr?"Otomotiv / EV Batarya":"Automotive / EV Battery"):domain==="software"?(tr?"Yazılım / API Güvenilirliği":"Software / API Reliability"):(tr?"Havacılık / İtki Testi":"Aerospace / Thruster Test");
  const domainFocus=domain==="automotive"?(tr?"batarya termal durumu, soğutma verimi ve araç yükü":"battery thermal state, cooling efficiency, and vehicle load"):domain==="software"?(tr?"API gecikmesi, veritabanı yükü ve önbellek isabeti":"API latency, database load, and cache hit rate"):(tr?"termal durum, titreşim, basınç ve itki yükü":"thermal state, vibration, pressure, and thrust load");
  const projectIntro=tr?`${project} · ${domainName} bağlamındayım. ${domainFocus} için proje görevlerini ve son simülasyonları izliyorum.`:`I am in the ${project} · ${domainName} context, monitoring project tasks and recent simulations for ${domainFocus}.`;
  if(!open)return null;
  return <aside className="agent-panel global-agent"><div className="agent-header"><div className="agent-orb"><span/><i/></div><div><h2>{engineer} · World Agent</h2><span><i className="status-dot"/> {tr?"Aktif":"Active"} · {domainName}</span></div><button className="icon-button small" onClick={onClose}><Icon name="close" size={16}/></button></div><p className="agent-subtitle">{project} · {labels[language][page as keyof typeof labels.tr]}</p>
    {session?<div className="voice-session"><div className={`voice-orb ${voice}`}>{[1,2,3,4,5].map(i=><i key={i}/>)}</div><strong>{voice==="listening"?(tr?"Dinliyorum…":"Listening…"):voice==="processing"?(tr?"İşleniyor…":"Processing…"):voice==="speaking"?(tr?"Konuşuyor…":"Speaking…"):(tr?"Hazır":"Ready")}</strong><span>{voice==="idle"?(tr?"Devam etmek için mikrofona dokun.":"Tap the microphone to continue."):(tr?"DEMO ORTAMI · Ses oturumu":"DEMO ENVIRONMENT · Voice session")}</span><div className="voice-controls">{voice==="speaking"&&<button className="outline-button" onClick={interrupt}>■ {tr?"Konuşmayı Durdur":"Stop Speaking"}</button>}{voice==="idle"&&<button className="outline-button" onClick={startListening}><Icon name="mic" size={15}/>{tr?"Dinlemeye devam et":"Continue listening"}</button>}<button className="button end-voice" onClick={endSession}>× {tr?"Sesi Sonlandır":"End Voice"}</button></div></div>:<>
      <div className="conversation"><div className="date-separator">{project} · {tr?"DEMO BAĞLAMI":"DEMO CONTEXT"}</div><div className="agent-message"><span className="mini-agent">{engineer[0]}</span><div><p>{projectIntro}</p><div className="message-meta"><Icon name="shield" size={13}/>{tr?"Proje bağlamı etkin":"Project context active"}</div></div></div>{messages.map((item,index)=><div className={item.from==="user"?"user-message":"agent-message inline"} key={index}>{item.from==="ai"&&<span className="mini-agent">{engineer[0]}</span>}<p>{item.text}</p></div>)}</div>
      <div className="agent-quick-actions"><button onClick={()=>onNavigate("Simulations")}>{tr?"Simülasyonu aç":"Open simulation"}</button><button onClick={()=>process(tr?"Bugünkü görevlerimi özetle":"Summarize today's tasks")}>{tr?"Görevleri özetle":"Summarize tasks"}</button></div>
      <form className="message-box" onSubmit={submit}><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder={tr?"Bu çalışma alanı hakkında sor…":"Ask about this workspace…"} aria-label="Message"/><div><button type="button" className="icon-button small" onClick={beginSession}><Icon name="mic" size={17}/></button><span>{tr?`${labels.tr[page as keyof typeof labels.tr]} bağlamı dahil`:`${page} context included`}</span><button className="send-button" type="submit" disabled={!message.trim()}><Icon name="send" size={16}/></button></div></form></>}
  </aside>;
}

export function Workspace({ onExit, language, onLanguageChange, theme, onThemeChange }: {
  onExit:()=>void; language:Language; onLanguageChange:(language:Language)=>void; theme:Theme; onThemeChange:(theme:Theme)=>void;
}) {
  // Workspace state stays inside the component so generated modules never contain top-level returns.
  const tr=language==="tr"; const [page,setPage]=useState("Overview"); const [collapsed,setCollapsed]=useState(false); const [search,setSearch]=useState(false); const [agentOpen,setAgentOpen]=useState(true); const [demoMode,setDemoMode]=useState(true);
  const pageHistory=useRef<string[]>(["Overview"]); const historyIndex=useRef(0); const [,refreshHistory]=useState(0);
  const [activeDomain,setActiveDomain]=useState<Domain>(()=>settingsStore.get("active_domain","automotive"));
  const [activeProject,setActiveProject]=useState(()=>settingsStore.get("active_project","Northstar Facility"));
  const [assistantSession,setAssistantSession]=useState(()=>settingsStore.get("assistant_session",Date.now()));
  const [toasts,setToasts]=useState<Toast[]>([]); const [reminders,setReminders]=useState<Reminder[]>(()=>readLocal("world-reminders",initialReminders));
  const [activity,setActivity]=useState<Activity[]>(()=>readLocal("world-activities",seedActivities)); const [memory,setMemory]=useState<Memory[]>(()=>readLocal("world-memories",seedMemories));
  const [profile,setProfile]=useState<Profile>(()=>readLocal("world-profile",{name:"Sarah",surname:"Chen",title:"Systems Engineer",department:"Advanced Systems",organization:"Northstar Labs",expertise:"Autonomous systems",interests:"Simulation, robotics",timezone:"Europe/Istanbul",notifications:true,engineer:"AURA",communication:"Balanced",interaction:"Proactive",voice:"Voice A",domain:"Automotive"}));
  const toast=(message:string,tone:"success"|"error"="success")=>{const id=Date.now();setToasts(value=>[...value,{id,message,tone}]);window.setTimeout(()=>setToasts(value=>value.filter(item=>item.id!==id)),2800)};
  useEffect(()=>localStorage.setItem("world-reminders",JSON.stringify(reminders)),[reminders]);
  useEffect(()=>localStorage.setItem("world-profile",JSON.stringify(profile)),[profile]);
  useEffect(()=>localStorage.setItem("world-activities",JSON.stringify(activity)),[activity]);
  useEffect(()=>localStorage.setItem("world-memories",JSON.stringify(memory)),[memory]);
  useEffect(()=>settingsStore.set("active_domain",activeDomain),[activeDomain]);
  useEffect(()=>settingsStore.set("active_project",activeProject),[activeProject]);
  useEffect(()=>settingsStore.set("assistant_session",assistantSession),[assistantSession]);
  useEffect(()=>worldEvents.on(event=>{
    const actions:Record<string,string>=language==="tr"?{
      "sensor.updated":"Sensör 07 simüle edilmiş anomali verisi bildirdi",
      "agent.started":`${event.actor} görevi başlattı`,
      "simulation.started":"Simulation Agent üç senaryoyu modellemeye başladı",
      "simulation.completed":"Üç deterministik senaryo üretildi",
      "human.approval_required":"Safety Agent mühendis onayı istedi",
      "agent.completed":`${event.actor} işlemi tamamladı`,
      "assistant.assigned":`${event.actor} aktif AI Mühendisi oldu`,
    }:{
      "sensor.updated":"Sensor 07 reported simulated anomaly data",
      "agent.started":`${event.actor} started a task`,
      "simulation.started":"Simulation Agent started modeling three scenarios",
      "simulation.completed":"Three deterministic scenarios were generated",
      "human.approval_required":"Safety Agent requested engineer approval",
      "agent.completed":`${event.actor} completed the operation`,
      "assistant.assigned":`${event.actor} became the active AI Engineer`,
    };
    setActivity(value=>[{actor:event.actor,action:actions[event.type]||event.type,time:new Date(event.timestamp).toLocaleTimeString(language==="tr"?"tr-TR":"en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),tone:event.type.includes("completed")?"teal":"violet"},...value]);
  }),[language]);
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key==="k"){event.preventDefault();setSearch(true)}if(event.key==="Escape")setSearch(false)};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[]);
  const addMemory=(title:string,detail:string,type:string)=>setMemory(value=>[{time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}),title,detail,type},...value]);
  const createReminder=(item:Omit<Reminder,"id">)=>{setReminders(value=>[{...item,id:Date.now()},...value]);addMemory(tr?"Hatırlatıcı oluşturuldu":"Reminder created",item.title,"Reminder");setActivity(value=>[{actor:"World Agent",action:`${item.title} · ${tr?"hatırlatıcı oluşturuldu":"reminder created"}`,time:tr?"Şimdi":"Now",tone:"teal"},...value]);toast(tr?"Hatırlatıcı oluşturuldu.":"Reminder created.")};
  const updateReminder=(item:Reminder)=>{setReminders(value=>value.map(current=>current.id===item.id?item:current));toast(tr?"Hatırlatıcı güncellendi.":"Reminder updated.")};
  const deleteReminder=(id:number)=>{setReminders(value=>value.filter(item=>item.id!==id));toast(tr?"Hatırlatıcı silindi.":"Reminder deleted.")};
  const completeSimulation=()=>{setActivity(value=>[{actor:"Simulation Agent",action:tr?"3 batarya senaryosu oluşturdu":"Generated 3 battery scenarios",time:tr?"Şimdi":"Now",tone:"violet"},{actor:"Safety Agent",action:tr?"Risk değerlendirmesini tamamladı":"Completed risk assessment",time:tr?"Şimdi":"Now",tone:"teal"},...value]);addMemory(tr?"Batarya termal simülasyonu tamamlandı":"Battery thermal simulation completed",tr?"Araç 07 için üç senaryo oluşturuldu.":"Three scenarios generated for Vehicle 07.","Simulation");toast(tr?"Simülasyon tamamlandı.":"Simulation completed.")};
  const toggleDemo=()=>{const next=!demoMode;setDemoMode(next);toast(next?(tr?"Demo modu etkin.":"Demo mode enabled."):(tr?"Demo modu kapalı.":"Demo mode disabled."));if(next){setActivity(value=>[{actor:"World Agent",action:tr?"Araç 07 sıcaklık anomalisi algılandı":"Detected Vehicle 07 temperature anomaly",time:tr?"Şimdi":"Now",tone:"blue"},...value]);addMemory(tr?"Demo senaryosu başlatıldı":"Demo scenario started",tr?"Simüle edilmiş Araç 07 telemetrisi yüklendi.":"Simulated Vehicle 07 telemetry loaded.","Demo")}};
  const navigate=(value:string)=>{
    if(value===page)return;
    pageHistory.current=pageHistory.current.slice(0,historyIndex.current+1);
    pageHistory.current.push(value); historyIndex.current=pageHistory.current.length-1;
    setPage(value); refreshHistory(version=>version+1); window.scrollTo({top:0,behavior:"smooth"});
    if(window.innerWidth<900)setAgentOpen(false);
  };
  const travelHistory=(direction:-1|1)=>{
    const next=historyIndex.current+direction;
    if(next<0||next>=pageHistory.current.length)return;
    historyIndex.current=next; setPage(pageHistory.current[next]); refreshHistory(version=>version+1);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const saveProfile=(value:Profile)=>{setProfile(value);toast(tr?"Profil güncellendi.":"Profile updated.")};
  const assignEngineer=(engineer:string)=>{const previous=profile.engineer;const selected=engineerProfiles.find(item=>item.name===engineer);setProfile(value=>({...value,engineer,voice:value.voicePreferences?.[engineer]||selected?.voice||value.voice}));addMemory(tr?"AI görüşmesi arşivlendi":"AI conversation archived",`${previous} · ${tr?"önceki oturum hafızaya alındı":"previous session retained in memory"} · ${assistantSession}`,"Conversation");addMemory(tr?"AI Mühendisi değiştirildi":"AI Engineer changed",`${engineer} ${tr?"aktif asistan olarak atandı.":"was assigned as active assistant."}`,"Profile");setAssistantSession(Date.now());worldEvents.emit({type:"assistant.assigned",actor:engineer,projectId:"northstar",payload:{previous}});toast(tr?`${engineer} artık aktif AI Mühendisin. Yeni sohbet başlatıldı.`:`${engineer} is now your active AI Engineer. A new conversation was started.`)};
  const changeTheme=(value:Theme)=>{onThemeChange(value);toast(tr?`${value} tema etkinleştirildi.`:`${value} theme enabled.`)};
  const pageContent=useMemo(()=>{
    if(page==="Overview")return <Overview language={language} project={activeProject} reminders={reminders} demoMode={demoMode} onDemo={toggleDemo} onNavigate={navigate} onOpenAI={()=>setAgentOpen(true)} onScenario={(domain,parameters)=>{setActiveDomain(domain);navigate("Simulations");window.setTimeout(()=>worldEvents.emit({type:"command.simulation_requested",actor:"World Agent",projectId:activeProject,payload:{domain,run:false,primary:parameters.primary??-1,reliability:parameters.reliability??-1,efficiency:parameters.efficiency??-1,load:parameters.load??-1}}),160)}}/>;
    if(page==="Reminders")return <RemindersPage language={language} reminders={reminders} onCreate={createReminder} onUpdate={updateReminder} onDelete={deleteReminder}/>;
    if(page==="Simulations")return <SimulationLab language={language} initialDomain={activeDomain} onDomainChange={setActiveDomain} onActivity={()=>{}} onMemory={addMemory} onToast={toast}/>;
    if(page==="Profile")return <ProfilePage language={language} profile={profile} onSave={value=>{saveProfile(value);navigate("Overview")}} onAssign={assignEngineer} onLanguage={onLanguageChange}/>;
    if(page==="Settings")return <SettingsPage language={language} theme={theme} profile={profile} demoMode={demoMode} onLanguage={onLanguageChange} onTheme={changeTheme} onProfile={saveProfile} onDemo={toggleDemo}/>;
    return <DataPage page={page} language={language} memories={memory} activities={activity} onNavigate={navigate} onProjectSelect={setActiveProject}/>;
  },[page,language,reminders,demoMode,profile,theme,memory,activity,activeDomain,activeProject]);
  return <div className={`workspace ${collapsed?"sidebar-collapsed":""} ${agentOpen?"agent-visible":""}`}>
    <aside className="sidebar"><button className="brand sidebar-brand" onClick={onExit}><span className="brand-mark"><i/><i/><i/></span><strong>WORLD</strong><span>OS</span></button><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label="Collapse"><Icon name="chevron" size={14}/></button><nav>{navItems.map(([name,icon])=><button className={page===name?"active":""} key={name} onClick={()=>navigate(name)}><Icon name={icon} size={19}/><span>{labels[language][name as keyof typeof labels.tr]}</span>{name==="Reminders"&&<i className="nav-count">{reminders.filter(item=>item.status==="Upcoming").length}</i>}</button>)}</nav><div className="sidebar-bottom"><div className="system-health"><i/><span><b>{tr?"Sistemler sağlıklı":"Systems healthy"}</b><small>{tr?"Şimdi kontrol edildi":"Checked now"}</small></span></div><button onClick={()=>navigate("Settings")}><Icon name="shield" size={18}/><span>{tr?"Gizlilik ve erişim":"Privacy & access"}</span></button></div></aside>
    <main className="workspace-main"><Header page={page} project={activeProject} profile={profile} language={language} theme={theme} onLanguage={onLanguageChange} onTheme={changeTheme} onSearch={()=>setSearch(true)} onProfile={()=>navigate("Profile")} onBack={()=>travelHistory(-1)} onForward={()=>travelHistory(1)} canBack={historyIndex.current>0} canForward={historyIndex.current<pageHistory.current.length-1}/><div className="workspace-content">{pageContent}</div></main>
    <button className="global-ai-button" onClick={()=>setAgentOpen(!agentOpen)}><span className="agent-orb"><i/></span><span>{profile.engineer}<small>{tr?"AI İş Arkadaşı":"AI Workmate"}</small></span></button>
    <div className="page-jump-controls" aria-label={tr?"Sayfa konumu":"Page position"}>
      <button className="icon-button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label={tr?"Sayfa başına git":"Go to page top"}>↑</button>
      <button className="icon-button" onClick={()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"smooth"})} aria-label={tr?"Sayfa sonuna git":"Go to page bottom"}>↓</button>
    </div>
    <AgentPanel key={`${profile.engineer}.${assistantSession}.${activeDomain}.${activeProject}`} open={agentOpen} language={language} page={page} project={activeProject} engineer={profile.engineer} sessionId={assistantSession} domain={activeDomain} onClose={()=>setAgentOpen(false)} onReminder={createReminder} onNavigate={navigate} onProjectChange={setActiveProject} onSimulationCommand={(domain,parameters,run)=>{setActiveDomain(domain);navigate("Simulations");window.setTimeout(()=>worldEvents.emit({type:"command.simulation_requested",actor:profile.engineer,projectId:activeProject,payload:{domain,run,primary:parameters.primary??-1,reliability:parameters.reliability??-1,efficiency:parameters.efficiency??-1,load:parameters.load??-1}}),160)}}/>
    {search&&<SearchModal language={language} onClose={()=>setSearch(false)} onNavigate={navigate}/>}<Toasts toasts={toasts}/>
  </div>;
}
