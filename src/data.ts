export type Agent = {
  id: string;
  name: string;
  initials: string;
  specialization: string;
  status: "Active" | "Idle" | "Review";
  task: string;
  reliability: number;
  connected: string[];
  memories: number;
};

export const agents: Agent[] = [
  {
    id: "vision",
    name: "Vision Agent",
    initials: "VI",
    specialization: "Computer vision",
    status: "Active",
    task: "Analyzing loading bay camera feed",
    reliability: 96,
    connected: ["World Agent", "Safety Agent"],
    memories: 1284,
  },
  {
    id: "simulation",
    name: "Simulation Agent",
    initials: "SI",
    specialization: "Scenario modeling",
    status: "Active",
    task: "Modeling alternate route for Robot 03",
    reliability: 93,
    connected: ["World Agent", "Data Agent"],
    memories: 842,
  },
  {
    id: "safety",
    name: "Safety Agent",
    initials: "SA",
    specialization: "Risk and compliance",
    status: "Review",
    task: "Reviewing Zone B access change",
    reliability: 99,
    connected: ["Vision Agent", "World Agent"],
    memories: 2103,
  },
  {
    id: "data",
    name: "Data Agent",
    initials: "DA",
    specialization: "Operational intelligence",
    status: "Idle",
    task: "Monitoring environmental sensor stream",
    reliability: 95,
    connected: ["Simulation Agent"],
    memories: 3176,
  },
];

export const activities = [
  { actor: "World Agent", action: "Requested sensor analysis", time: "Now", tone: "blue" },
  { actor: "Vision Agent", action: "Completed image analysis", time: "2m", tone: "teal" },
  { actor: "Simulation Agent", action: "Generated 3 scenarios", time: "5m", tone: "violet" },
  { actor: "Sarah Chen", action: "Approved recommended action", time: "8m", tone: "sand" },
  { actor: "Robot 02", action: "Entered Loading Zone B", time: "12m", tone: "slate" },
];

export const memories = [
  { time: "14:40", title: "Action completed", detail: "Robot 02 resumed the approved route.", type: "Action" },
  { time: "14:38", title: "Human approval received", detail: "Sarah approved the recommended containment step.", type: "Decision" },
  { time: "14:36", title: "Simulation performed", detail: "Three routing scenarios evaluated against live conditions.", type: "Simulation" },
  { time: "14:34", title: "Visual analysis complete", detail: "Vision Agent found a partial obstruction near Bay 04.", type: "AI event" },
  { time: "14:32", title: "Sensor anomaly detected", detail: "Proximity signal deviated from its expected range.", type: "Sensor" },
];

export const projects = [
  { name: "Northstar Facility", place: "Seattle, WA", status: "Operational", people: 6, agents: 8, sensors: 24 },
  { name: "Field Lab 02", place: "Austin, TX", status: "Monitoring", people: 4, agents: 5, sensors: 18 },
  { name: "Autonomy Pilot", place: "Berlin, DE", status: "Simulation", people: 9, agents: 11, sensors: 32 },
];

export type Reminder = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  category: "Personal" | "Project" | "Engineering" | "AI" | "Meeting";
  status: "Upcoming" | "Completed" | "Overdue";
};

export const initialReminders: Reminder[] = [
  { id: 1, title: "Ekip toplantısı", description: "Northstar günlük operasyon toplantısı", date: new Date().toISOString().slice(0, 10), time: "09:30", priority: "Medium", category: "Meeting", status: "Completed" },
  { id: 2, title: "Simülasyon incelemesi", description: "Batarya termal senaryolarını değerlendir", date: new Date().toISOString().slice(0, 10), time: "13:00", priority: "High", category: "Engineering", status: "Upcoming" },
  { id: 3, title: "Proje dokümantasyonu", description: "Haftalık teknik raporu tamamla", date: new Date().toISOString().slice(0, 10), time: "17:00", priority: "Medium", category: "Project", status: "Upcoming" },
];
