import { useEffect, useState } from "react";
import type { Language } from "../App";

type WorldObject = {
  id: string;
  x: number;
  y: number;
  type: string;
  label: string;
  status: string;
};

const objectData = [
  { id: "human", x: 20, y: 40, type: ["Kişi","Person"], label: ["Sarah Chen","Sarah Chen"], status: ["Bölge A'da","In Zone A"] },
  { id: "agent", x: 48, y: 26, type: ["AI Ajanı","AI Agent"], label: ["Görüntü Analiz Ajanı","Vision Agent"], status: ["Analiz ediyor","Analyzing"] },
  { id: "robot", x: 73, y: 59, type: ["Robot","Robot"], label: ["Robot 02","Robot 02"], status: ["Aktif rota","Active route"] },
  { id: "sensor", x: 48, y: 72, type: ["Sensör","Sensor"], label: ["Sensör 04","Sensor 04"], status: ["24.8 °C","24.8 °C"] },
  { id: "machine", x: 80, y: 25, type: ["Makine","Machine"], label: ["CNC İstasyonu","CNC Station"], status: ["Operasyonel","Operational"] },
];

export function WorldMap({ compact = false, language = "en" }: { compact?: boolean; language?: Language }) {
  const [selected, setSelected] = useState<WorldObject | null>(null);
  const [clock,setClock]=useState(()=>new Date());
  const [latency,setLatency]=useState(2.4);
  useEffect(()=>{const timer=window.setInterval(()=>{setClock(new Date());setLatency(value=>Number(Math.max(1.8,Math.min(3.1,value+(Math.random()-.5)*.18)).toFixed(1)))},1000);return()=>clearInterval(timer)},[]);
  const index = language === "tr" ? 0 : 1;
  const objects: WorldObject[] = objectData.map(item => ({ id:item.id,x:item.x,y:item.y,type:item.type[index],label:item.label[index],status:item.status[index] }));
  return (
    <div className={`world-map ${compact ? "world-map--compact" : ""}`}>
      <div className="map-grid" />
      <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M20 40L48 26L80 25M48 26L73 59L48 72M20 40L48 72" />
        <path className="signal-path" d="M20 40L48 26L73 59" />
      </svg>
      <div className="zone zone-a"><span>ZONE A</span></div>
      <div className="zone zone-b"><span>ZONE B</span></div>
      {objects.map((object) => (
        <button
          aria-label={`Open ${object.label}`}
          className={`map-node map-node--${object.type.toLowerCase().replace(" ", "-")} ${selected?.id === object.id ? "is-selected" : ""}`}
          key={object.id}
          onClick={() => setSelected(object)}
          style={{ left: `${object.x}%`, top: `${object.y}%` }}
        >
          <span className="node-pulse" />
          <span className="node-core">
            {object.id === "agent" ? "AI" : object.id === "robot" ? "R2" : object.type.charAt(0)}
          </span>
          <span className="node-label">{object.label}</span>
        </button>
      ))}
      <div className="map-legend">
        <span><i className="legend-dot human" /> {language === "tr" ? "İnsan" : "Human"}</span>
        <span><i className="legend-dot ai" /> {language === "tr" ? "AI ajanı" : "AI agent"}</span>
        <span><i className="legend-dot device" /> {language === "tr" ? "Cihaz" : "Device"}</span>
      </div>
      {!compact&&<footer className="map-live-footer"><span><i className="status-dot"/>{clock.toLocaleTimeString(language==="tr"?"tr-TR":"en-US",{hour12:false})}</span><span>PING {latency}{language==="tr"?"sn gecikme":"s latency"}</span></footer>}
      {selected && !compact && (
        <aside className="object-popover">
          <button aria-label="Close details" className="icon-button small" onClick={() => setSelected(null)}>×</button>
          <span className="eyebrow">{selected.type}</span>
          <strong>{selected.label}</strong>
          <span><i className="status-dot" /> {selected.status}</span>
          <button className="text-button" onClick={() => setSelected(null)}>{language === "tr" ? "Bağlamı gizle" : "Hide context"} ↑</button>
        </aside>
      )}
    </div>
  );
}
