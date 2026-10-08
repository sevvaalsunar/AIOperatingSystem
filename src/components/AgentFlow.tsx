import type { Language } from "../App";
import { createTranslator } from "../i18n";

type FlowState = "idle" | "running" | "paused" | "complete";

const nodes = ["world", "analysis", "simulation", "safety", "engineer"] as const;

export function AgentFlow({ language, activeStep, state, onSelect }: {
  language: Language; activeStep: number; state: FlowState; onSelect: (step: number) => void;
}) {
  const t = createTranslator(language);
  const states = ["collecting", "analyzing", "running", "evaluating", "approval"] as const;

  return <section className="agent-flow" aria-label={t("flow.title")}>
    <header><div><span className="eyebrow">{t("flow.title")}</span><p>{t("flow.subtitle")}</p></div><span className={`flow-state ${state}`}>{state === "paused" ? t("flow.paused") : state === "complete" ? t("flow.completed") : state === "running" ? states[Math.min(activeStep, 4)] && t(`flow.${states[Math.min(activeStep, 4)]}`) : t("flow.waiting")}</span></header>
    <div className="flow-track">
      {nodes.map((node, index) => <div className="flow-segment" key={node}>
        <button className={`flow-node ${index < activeStep ? "done" : index === activeStep && state !== "idle" ? "active" : ""}`} onClick={() => onSelect(index)} aria-label={t(`flow.${node}`)}>
          <i>{index < activeStep ? "✓" : String(index + 1).padStart(2, "0")}</i>
          <span><strong>{t(`flow.${node}`)}</strong><small>{index < activeStep ? t("flow.completed") : index === activeStep && state !== "idle" ? t(`flow.${states[index]}`) : t("flow.waiting")}</small></span>
        </button>
        {index < nodes.length - 1 && <div className={`flow-edge ${index < activeStep ? "passed" : index === activeStep && state === "running" ? "transmitting" : ""}`}><i /></div>}
      </div>)}
    </div>
  </section>;
}
