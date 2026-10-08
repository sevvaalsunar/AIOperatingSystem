export type Domain = "automotive" | "aerospace" | "software";

export type SimulationParameters = {
  primary: number;
  reliability: number;
  efficiency: number;
  load: number;
};

export type SimulationOutcome = {
  name: string;
  probability: number;
  risk: "Low" | "Medium" | "High";
  confidence: number;
};

export type SimulationRun = {
  id: string;
  domain: Domain;
  createdAt: string;
  parameters: SimulationParameters;
  outcomes: SimulationOutcome[];
  approved: boolean;
  saved: boolean;
};
