import { useEffect, useMemo, useRef, useState } from "react";
import type { Language } from "../App";
import { createTranslator } from "../i18n";
import { worldEvents } from "../services/events";
import { LocalRepository, settingsStore } from "../services/persistence";
import type { Domain, SimulationOutcome, SimulationParameters, SimulationRun } from "../types";
import { AgentFlow } from "./AgentFlow";
import { Icon } from "./Icon";

const repository = new LocalRepository<SimulationRun>("world.simulation_runs");

const defaults: Record<Domain, SimulationParameters> = {
  automotive: { primary: 36, reliability: 94, efficiency: 72, load: 64 },
  aerospace: { primary: 68, reliability: 97, efficiency: 83, load: 74 },
  software: { primary: 120, reliability: 99, efficiency: 86, load: 58 },
};

const domainMeta = {
  automotive: { icon: "EV", unit: "°C", primary: "temperature", second: "cooling", load: "speed", source: "sourceBattery" },
  aerospace: { icon: "PX", unit: "°C", primary: "thermal", second: "pressure", load: "thrust", source: "sourcePropulsion" },
  software: { icon: "API", unit: "ms", primary: "latency", second: "cacheHit", load: "traffic", source: "sourceApi" },
} as const;

function calculate(domain: Domain, parameters: SimulationParameters, language: Language): SimulationOutcome[] {
  const stress = domain === "software"
    ? Math.min(100, parameters.primary / 10 + parameters.load * .45 - parameters.efficiency * .25)
    : Math.min(100, parameters.primary * .8 + parameters.load * .25 - parameters.efficiency * .28);
  const uncertainty = (100 - parameters.reliability) * .35;
  const confidence = (value: number) => Math.round(Math.max(42, Math.min(96, value - uncertainty)));
  if (domain === "software") return [
    { name: language === "tr" ? "Veritabanı sorgu gerilemesi" : "Database query regression", probability: confidence(48 + stress * .35), risk: stress > 55 ? "High" : "Medium", confidence: confidence(88) },
    { name: language === "tr" ? "Dağıtım yapılandırması" : "Deployment configuration", probability: confidence(35 + stress * .22), risk: "Medium", confidence: confidence(79) },
    { name: language === "tr" ? "Trafik doygunluğu" : "Traffic saturation", probability: confidence(25 + stress * .18), risk: stress > 70 ? "High" : "Low", confidence: confidence(72) },
  ];
  if (domain === "aerospace") return [
    { name: language === "tr" ? "Termal kontrol bozulması" : "Thermal control degradation", probability: confidence(46 + stress * .3), risk: stress > 58 ? "High" : "Medium", confidence: confidence(90) },
    { name: language === "tr" ? "Mekanik titreşim bağlantısı" : "Mechanical vibration coupling", probability: confidence(34 + stress * .2), risk: "Medium", confidence: confidence(82) },
    { name: language === "tr" ? "Telemetri kalibrasyon sapması" : "Telemetry calibration drift", probability: confidence(20 + uncertainty), risk: "Low", confidence: confidence(74) },
  ];
  return [
    { name: language === "tr" ? "Soğutma sistemi bozulması" : "Cooling system degradation", probability: confidence(42 + stress * .35), risk: stress > 55 ? "High" : "Medium", confidence: confidence(89) },
    { name: language === "tr" ? "Sensör kalibrasyon sorunu" : "Sensor calibration issue", probability: confidence(23 + uncertainty * 1.5), risk: "Low", confidence: confidence(76) },
    { name: language === "tr" ? "Batarya hücre dengesizliği" : "Battery cell imbalance", probability: confidence(35 + stress * .28), risk: stress > 48 ? "High" : "Medium", confidence: confidence(92) },
  ];
}

export function SimulationLab({ language, initialDomain, onActivity, onMemory, onToast, onDomainChange }: {
  language: Language; initialDomain: Domain;
  onActivity: (actor: string, action: string) => void; onMemory: (title: string, detail: string, type: string) => void;
  onToast: (message: string) => void; onDomainChange?: (domain: Domain) => void;
}) {
  const t = createTranslator(language);
  const [domain, setDomain] = useState<Domain>(initialDomain);
  const [parametersByDomain, setParametersByDomain] = useState<Record<Domain,SimulationParameters>>(() => settingsStore.get("domain_parameters", defaults));
  const [sourceMode, setSourceMode] = useState<"simulation"|"live">(() => settingsStore.get("source_mode", "simulation"));
  const [liveConnected,setLiveConnected]=useState(false);
  const [run, setRun] = useState<SimulationRun | null>(null);
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [state, setState] = useState<"idle" | "running" | "paused" | "complete">("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [inspectStep, setInspectStep] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);
  const timer = useRef<number | null>(null);
  const pendingAutoRun = useRef(false);
  const meta = domainMeta[domain];
  const parameters = parametersByDomain[domain];

  useEffect(() => { repository.list().then(setRuns); }, []);
  useEffect(() => { setDomain(initialDomain); }, [initialDomain]);
  useEffect(() => { setRun(null); setState("idle"); setActiveStep(0); onDomainChange?.(domain); }, [domain]);
  useEffect(() => { settingsStore.set("domain_parameters",parametersByDomain); }, [parametersByDomain]);
  useEffect(() => { settingsStore.set("source_mode",sourceMode); }, [sourceMode]);
  useEffect(()=>{
    if(sourceMode!=="live"||!liveConnected)return;
    const stream=window.setInterval(()=>setParametersByDomain(value=>{
      const current=value[domain];
      const min=domain==="software"?80:25; const max=domain==="software"?1000:95;
      const primary=Math.max(min,Math.min(max,Number((current.primary+(Math.random()-.42)*(domain==="software"?34:1.8)).toFixed(1))));
      return {...value,[domain]:{...current,primary,reliability:Math.max(82,Math.min(100,Number((current.reliability+(Math.random()-.5)*.8).toFixed(1))))}};
    }),1000);
    return()=>clearInterval(stream);
  },[sourceMode,liveConnected,domain]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const publish = (type: Parameters<typeof worldEvents.emit>[0]["type"], actor: string, payload: Record<string,string|number|boolean>) => worldEvents.emit({ type, actor, projectId: "northstar", payload });
  const progress = (step: number) => {
    setActiveStep(step);
    if (step === 0) { publish("sensor.updated","Sensor Layer",{ value: parameters.primary, domain }); onActivity("Sensor Layer", language === "tr" ? "Simüle edilmiş anomali verisi toplandı" : "Collected simulated anomaly data"); }
    if (step > 0 && step < 4) publish(step === 2 ? "simulation.started" : "agent.started", step === 1 ? "Analysis Agent" : step === 2 ? "Simulation Agent" : "Safety Agent", { step });
    if (step >= 4) {
      const completed: SimulationRun = { id: crypto.randomUUID(), domain, createdAt: new Date().toISOString(), parameters, outcomes: calculate(domain, parameters, language), approved: false, saved: false };
      setRun(completed); setState("complete"); publish("simulation.completed","Simulation Agent",{ runId: completed.id, domain });
      publish("human.approval_required","Safety Agent",{ runId: completed.id });
      onActivity("Simulation Agent", language === "tr" ? "Üç senaryo üretti; mühendis onayı bekleniyor" : "Generated three scenarios; engineer approval required");
      onMemory(language === "tr" ? "Simülasyon koşusu tamamlandı" : "Simulation run completed", `${domain} · ${completed.id.slice(0,8)}`, "Simulation");
      return;
    }
    timer.current = window.setTimeout(() => progress(step + 1), 900);
  };
  const start = () => { if (timer.current) clearTimeout(timer.current); setRun(null); setState("running"); setActiveStep(0); progress(0); };
  const togglePause = () => {
    if (state === "running") { if (timer.current) clearTimeout(timer.current); setState("paused"); }
    else if (state === "paused") { setState("running"); progress(activeStep); }
  };
  const save = async () => {
    if (!run) return; const saved = { ...run, saved: true }; await repository.save(saved); setRun(saved); setRuns(await repository.list()); onToast(t("sim.saved"));
  };
  const remove = async (id: string) => { await repository.remove(id); setRuns(await repository.list()); if (run?.id === id) setRun(null); onToast(t("sim.deleted")); };
  const approve = () => { if (!run) return; setRun({ ...run, approved: true }); onActivity("Human Engineer", language === "tr" ? "Önerilen tanı prosedürünü onayladı" : "Approved the recommended diagnostic procedure"); publish("agent.completed","Human Engineer",{ runId:run.id, approved:true }); };
  const recommendation = domain === "software" ? t("sim.softwareRecommendation") : domain === "aerospace" ? t("sim.aerospaceRecommendation") : t("sim.recommendation");
  const displayedPrimary = domain === "automotive" && state === "running" ? Math.min(53, parameters.primary + activeStep * 4) : parameters.primary;
  const inputDefs = useMemo(() => [
    { key: "primary" as const, label: t(`sim.${meta.primary}`), min: domain === "software" ? 80 : 25, max: domain === "software" ? 1000 : 95, unit: meta.unit },
    { key: "reliability" as const, label: t("sim.reliability"), min: 40, max: 100, unit: "%" },
    { key: "efficiency" as const, label: t(`sim.${meta.second}`), min: 20, max: 100, unit: "%" },
    { key: "load" as const, label: t(`sim.${meta.load}`), min: 10, max: 100, unit: "%" },
  ], [domain, language]);
  useEffect(() => worldEvents.on(event => {
    if (event.type !== "command.simulation_requested") return;
    const requestedDomain = event.payload.domain as Domain;
    const updates = {
      primary: Number(event.payload.primary),
      reliability: Number(event.payload.reliability),
      efficiency: Number(event.payload.efficiency),
      load: Number(event.payload.load),
    };
    setSourceMode("simulation");
    setLiveConnected(false);
    setDomain(requestedDomain);
    setParametersByDomain(value => {
      const next = { ...value[requestedDomain] };
      (Object.keys(updates) as Array<keyof typeof updates>).forEach(key => {
        if (Number.isFinite(updates[key]) && updates[key] >= 0) next[key] = updates[key];
      });
      return { ...value, [requestedDomain]: next };
    });
    pendingAutoRun.current = Boolean(event.payload.run);
  }), [domain, parametersByDomain, language]);
  useEffect(() => {
    if (!pendingAutoRun.current) return;
    pendingAutoRun.current = false;
    window.setTimeout(start, 120);
  }, [domain, parameters.primary]);

  return <section className="simulation-lab">
    <header className="simulation-title"><div><span className="eyebrow">{t("sim.eyebrow")}</span><h2>{t("sim.title")}</h2><p>{t("sim.subtitle")}</p></div><div className="domain-switch">{(["automotive","aerospace","software"] as Domain[]).map(item => <button className={domain === item ? "active" : ""} onClick={() => setDomain(item)} key={item}>{t(`sim.${item}`)}</button>)}</div></header>
    <div className="source-ribbon"><span>{sourceMode === "simulation" ? t("common.simulation") : "LIVE"}</span><strong>{sourceMode === "simulation" ? t(`sim.${meta.source}`) : liveConnected?t("sim.liveConnected"):t("sim.liveDisconnected")}</strong><div className="source-switch" aria-label={t("sim.sourceMode")}><button className={sourceMode==="simulation"?"active":""} onClick={()=>setSourceMode("simulation")}>{t("sim.simulatedSource")}</button><button className={sourceMode==="live"?"active":""} onClick={()=>setSourceMode("live")}>{t("sim.liveSource")}</button></div>{sourceMode==="live"?<button className={`connector-button ${liveConnected?"connected":""}`} onClick={()=>setLiveConnected(value=>!value)}>{liveConnected?t("sim.disconnect"):t("sim.connect")}</button>:<small>{t("common.prototype")}</small>}</div>
    <div className="simulation-workbench">
      <aside className="parameter-rail"><header><span className="domain-glyph">{meta.icon}</span><div><strong>{t(`sim.${domain}`)}</strong><small>{sourceMode === "simulation" ? t("common.demoData") : liveConnected?t("sim.liveConnected"):t("sim.liveDisconnected")}</small></div></header>{inputDefs.map(input => <label key={input.key}><span>{input.label}<b>{parameters[input.key]}{input.unit}</b></span><input type="range" min={input.min} max={input.max} value={parameters[input.key]} disabled={sourceMode==="live"} onChange={event => setParametersByDomain(value => ({ ...value, [domain]: { ...value[domain], [input.key]: Number(event.target.value) } }))}/><small>{t("common.source")}: {sourceMode === "simulation" ? t(`sim.${meta.source}`) : liveConnected?t("sim.liveConnected"):t("sim.liveDisconnected")}</small></label>)}<button className="button primary" onClick={start} disabled={state === "running" || (sourceMode === "live"&&!liveConnected)}><Icon name="simulation" size={16}/>{state === "complete" ? t("sim.runAgain") : state === "running" ? t("sim.running") : t("sim.run")}</button>{(state === "running" || state === "paused") && <button className="outline-button full" onClick={togglePause}>{state === "paused" ? t("sim.resume") : t("sim.pause")}</button>}</aside>
      <div className="operational-canvas">
        <div className={`domain-machine ${domain}`}><div className="machine-outline"><span>{domain==="software"?(language==="tr"?"API GÜVENİLİRLİK TOPOLOJİSİ":"API RELIABILITY TOPOLOGY"):meta.icon}</span>{[0,1,2,3].map(item => <i key={item}>{domain==="software"?["Gateway","API Service","Database","Queue"][item]:""}</i>)}</div><div className="sensor-readout"><span>{t(`sim.${meta.primary}`)}</span><strong>{displayedPrimary}{meta.unit}</strong><small>{t(`sim.${meta.source}`)}</small></div><div className={`anomaly-wave ${state === "running" ? "active" : ""}`}>{[1,2,3,4,5,6,7,8].map(i => <i key={i}/>)}</div></div>
        <AgentFlow language={language} activeStep={activeStep} state={state} onSelect={setInspectStep}/>
        {inspectStep !== null && <div className="stage-inspector"><button onClick={() => setInspectStep(null)}>×</button><span className="eyebrow">{String(inspectStep + 1).padStart(2,"0")} · {t(`flow.${["world","analysis","simulation","safety","engineer"][inspectStep]}`)}</span><p>{inspectStep < activeStep ? t("flow.completed") : inspectStep === activeStep ? t(`flow.${["collecting","analyzing","running","evaluating","approval"][inspectStep]}`) : t("flow.waiting")}</p></div>}
      </div>
    </div>
    {run && <section className="simulation-output"><header><div><span className="eyebrow">{t("flow.completed")} · {new Date(run.createdAt).toLocaleTimeString(language === "tr" ? "tr-TR" : "en-US")}</span><h3>{language === "tr" ? "Olası senaryolar" : "Possible scenarios"}</h3></div><div><button className="outline-button" onClick={() => setComparing(!comparing)}><Icon name="eye" size={15}/>{t("sim.compareRuns")}</button><button className="outline-button" onClick={save} disabled={run.saved}><Icon name="memory" size={15}/>{t("sim.saveScenario")}</button><button className="icon-button danger" onClick={() => remove(run.id)} aria-label={t("sim.deleteRun")}>×</button></div></header><div className="outcome-table metrics-v3"><div className="outcome-head"><span>{language === "tr" ? "Senaryo" : "Scenario"}</span><span>{language === "tr" ? "Tepe Metrik" : "Peak Metric"}</span><span>{language === "tr" ? "Risk Olasılığı" : "Risk Probability"}</span><span>{language === "tr" ? "Güven" : "Confidence"}</span><span>{language === "tr" ? "Delta Varyans" : "Delta Variance"}</span></div>{run.outcomes.map((outcome,index) => {const delta=Math.round(Math.abs(run.parameters.primary-defaults[domain].primary)*(1+index*.18));return <div className={index === 2 && domain === "automotive" ? "critical" : ""} key={outcome.name}><span><i>{String.fromCharCode(65+index)}</i><strong>{outcome.name}</strong></span><span className="technical">{Math.round(run.parameters.primary*(1+index*.04))}{meta.unit}</span><span><b style={{width:`${outcome.probability}%`}}/>{outcome.probability}% · {outcome.risk}</span><span>{outcome.confidence}%</span><span className={delta>10?"risk-high":"risk-low"}>{delta>0?"+":""}{delta}{meta.unit}</span></div>})}</div><div className="ai-recommendation"><span className="mini-agent">W</span><div><span className="eyebrow">WORLD AGENT · {language === "tr" ? "ÖNERİ" : "RECOMMENDATION"}</span><p>{recommendation}</p><div><button onClick={() => setInspectStep(3)}>{t("sim.evidence")}</button><button onClick={start}>{t("sim.runAgain")}</button></div></div>{run.approved ? <strong>✓ {language === "tr" ? "Onaylandı" : "Approved"}</strong> : <button className="button primary small-button" onClick={approve}>{t("sim.approval")}</button>}</div></section>}
    {comparing && <section className="run-history"><header><h3>{t("sim.compareRuns")}</h3><button className="icon-button small" onClick={() => setComparing(false)}>×</button></header>{runs.length ? runs.slice(0,4).map(saved => <div key={saved.id}><span>{new Date(saved.createdAt).toLocaleString(language === "tr" ? "tr-TR" : "en-US")}</span><strong>{t(`sim.${saved.domain}`)}</strong><span>{saved.parameters.primary}{domainMeta[saved.domain].unit}</span><span>{saved.outcomes[0].confidence}%</span><button className="icon-button small danger" onClick={() => remove(saved.id)}>×</button></div>) : <div className="smart-empty"><Icon name="simulation" size={24}/><p>{t("sim.noRuns")}</p><button className="text-button" onClick={start}>{t("sim.firstRun")} →</button></div>}</section>}
  </section>;
}
