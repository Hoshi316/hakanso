export type Step = {
  id: string;
  title: string;
  description: string;
  scheduledDay: number;
  done: boolean;
};

export type Phase = {
  title: string;
  startDay: number;
  endDay: number;
  description: string;
};

export type RoutePlan = {
  goal: string;
  summary: string;
  steps: {
    title: string;
    description: string;
    scheduledDay: number;
  }[];
};

export type RouteDoc = {
  userId: string;
  goal: string;
  durationDays: number;
  message: string;
  summary: string;
  steps: Step[];
  progress: number;
  createdAt: string;
  phases?: Phase[];
  status?: "active" | "abandoned";
  abandonReason?: string;
  abandonedAt?: string;
};