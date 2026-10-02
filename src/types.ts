export type IssueCategory = "infrastructure" | "eco-assets" | "waste" | "mobility" | "water";

export type UrgencyLevel = "LVL_1_NOMINAL" | "LVL_2_MODERATE" | "LVL_3_ELEVATED" | "LVL_4_CRITICAL";

export interface CadTelemetryAction {
  timestamp: string;
  txCode: string;
  operation: string;
  nodeOperator: string;
}

export interface CadReportItem {
  id: string;
  specCode: string;
  title: string;
  category: IssueCategory;
  categoryLabel: string;
  status: "INVESTIGATING" | "WORKORDER_QUEUED" | "CREW_DISPATCHED" | "RESOLVED_VERIFIED";
  urgency: UrgencyLevel;
  gridSector: string;
  location: string;
  coords: [number, number];
  reportedTime: string;
  upvotes: number;
  reporterId: string;
  structuralDiagnosis: string;
  toleranceDelta: string;
  image: string;
  blueprintDim: string;
  actions: CadTelemetryAction[];
}

export interface SdgTargetSpec {
  id: string;
  subsystem: string;
  title: string;
  specDesignation: string;
  engineeringStandard: string;
  description: string;
  metricsRatio: string;
  cadAction: string;
  diagramSvgType: string;
}

export interface CadChecklistItem {
  id: string;
  componentCode: string;
  role: string;
  taskTitle: string;
  impactXp: number;
  cadTolerance: string;
  specification: string;
}
