export type WorldEventType =
  | "sensor.updated" | "agent.started" | "agent.completed" | "simulation.started"
  | "simulation.completed" | "human.approval_required" | "reminder.created"
  | "memory.created" | "assistant.assigned" | "command.simulation_requested";

export type WorldEvent = {
  id: string;
  type: WorldEventType;
  timestamp: string;
  actor: string;
  projectId: string;
  payload: Record<string, string | number | boolean>;
};

type Listener = (event: WorldEvent) => void;

class EventStream {
  private listeners = new Set<Listener>();
  on(listener: Listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit(event: Omit<WorldEvent, "id" | "timestamp">) {
    const complete = { ...event, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    this.listeners.forEach(listener => listener(complete));
    return complete;
  }
}

export const worldEvents = new EventStream();
