import { useState } from "react";
import type { Language } from "../App";
import { createTranslator } from "../i18n";
import { Icon } from "./Icon";

export type Engineer = {
  name: string; title: Record<Language,string>; style: Record<Language,string>; specialties: Record<Language,string[]>;
  capabilities: string[]; voice: string;
};

export const engineerProfiles: Engineer[] = [
  { name:"AURA",title:{tr:"Sistem Mühendisliği AI",en:"Systems Engineering AI"},style:{tr:"Dengeli · Analitik · Proaktif",en:"Balanced · Analytical · Proactive"},specialties:{tr:["sistem analizi","teknik planlama","araştırma"],en:["systems analysis","technical planning","research"]},capabilities:["High","Medium","Medium","High","High"],voice:"Calm Female" },
  { name:"NOVA",title:{tr:"Yazılım Mühendisliği AI",en:"Software Engineering AI"},style:{tr:"Doğrudan · Pragmatik · Dengeli",en:"Direct · Pragmatic · Balanced"},specialties:{tr:["kod analizi","mimari","altyapı"],en:["code analysis","architecture","infrastructure"]},capabilities:["Very High","Low","Medium","High","High"],voice:"Soft Neutral" },
  { name:"ORBIT",title:{tr:"Havacılık Sistemleri AI",en:"Aerospace Systems AI"},style:{tr:"Teknik · Sakin · Proaktif",en:"Technical · Calm · Proactive"},specialties:{tr:["telemetri analizi","simülasyon","anomali tespiti"],en:["telemetry analysis","simulation","anomaly detection"]},capabilities:["Medium","Very High","Low","Very High","High"],voice:"Neutral Professional" },
  { name:"VECTOR",title:{tr:"Otomotiv Sistemleri AI",en:"Automotive Systems AI"},style:{tr:"Teknik · Kararlı · Proaktif",en:"Technical · Decisive · Proactive"},specialties:{tr:["batarya sistemleri","ADAS","tanılama"],en:["battery systems","ADAS","diagnostics"]},capabilities:["Medium","Low","Very High","High","Medium"],voice:"Confident Male" },
];

export function EngineerComparison({ language, current, onCancel, onAssign }: { language: Language; current: string; onCancel: () => void; onAssign: (engineer: Engineer) => void }) {
  const t=createTranslator(language); const [selected,setSelected]=useState(current); const [preview,setPreview]=useState<Engineer|null>(null); const [confirm,setConfirm]=useState(false);
  const candidate=engineerProfiles.find(item=>item.name===selected)!; const capabilityLabels=["software","aerospace","automotive","simulation","research"];
  const levelKey: Record<string,string> = { "Very High":"veryHigh", High:"high", Medium:"medium", Low:"low" };
  return <div className="engineer-comparison"><header><div><h2>{t("engineer.choose")}</h2><p>{t("engineer.subtitle")}</p></div><button className="icon-button" onClick={onCancel}><Icon name="close" size={17}/></button></header><div className="comparison-table"><div className="comparison-head"><span>{t("engineer.capability")}</span>{engineerProfiles.map(engineer=><button className={selected===engineer.name?"selected":""} onClick={()=>setSelected(engineer.name)} key={engineer.name}><i>{engineer.name.slice(0,2)}</i><strong>{engineer.name}</strong><small>{engineer.title[language]}</small></button>)}</div>{capabilityLabels.map((label,index)=><div className="capability-row" key={label}><strong>{t(`engineer.${label}`)}</strong>{engineerProfiles.map(engineer=><span className={selected===engineer.name?"selected":""} key={engineer.name}>{t(`engineer.${levelKey[engineer.capabilities[index]]}`)}</span>)}</div>)}<div className="capability-row"><strong>{t("engineer.voice")}</strong>{engineerProfiles.map(engineer=><span className={selected===engineer.name?"selected":""} key={engineer.name}>{engineer.voice}</span>)}</div></div><footer><div><button className="outline-button" onClick={()=>setPreview(candidate)}>{t("common.preview")}</button><button className="button primary small-button" disabled={selected===current} onClick={()=>setConfirm(true)}>{t("common.assign")} {selected}</button></div></footer>
    {preview&&<aside className="engineer-preview"><button className="icon-button small" onClick={()=>setPreview(null)}>×</button><span className="engineer-avatar">{preview.name.slice(0,2)}</span><span className="eyebrow">{preview.title[language]}</span><h3>{preview.name}</h3><p>{preview.style[language]}</p><dl><dt>{t("engineer.specialization")}</dt><dd>{preview.specialties[language].join(" · ")}</dd><dt>{t("engineer.capabilities")}</dt><dd>Research · Simulation · Data Analysis · Voice</dd><dt>Voice</dt><dd>{preview.voice}</dd></dl></aside>}
    {confirm&&<div className="confirm-layer"><section><Icon name="agents" size={24}/><h3>{t("engineer.confirmTitle")}</h3><p>{t("engineer.confirmBody")}</p><div className="assignment-change"><span>{t("engineer.current")}<b>{current}</b></span><Icon name="arrow" size={18}/><span>{t("engineer.next")}<b>{selected}</b></span></div><footer><button className="outline-button" onClick={()=>setConfirm(false)}>{t("common.cancel")}</button><button className="button primary small-button" onClick={()=>onAssign(candidate)}>{t("common.assign")} {selected}</button></footer></section></div>}
  </div>;
}
