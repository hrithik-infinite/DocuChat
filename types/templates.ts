export type SummaryTemplate = "executive" | "detailed" | "study-notes" | "meeting-notes";

export interface TemplateConfig {
  name: string;
  description: string;
  icon: string;
}

export const TEMPLATES: Record<SummaryTemplate, TemplateConfig> = {
  executive: {
    name: "Executive Summary",
    description: "Brief, high-level overview for quick decisions",
    icon: "Briefcase",
  },
  detailed: {
    name: "Detailed Analysis",
    description: "Comprehensive breakdown with full context",
    icon: "FileText",
  },
  "study-notes": {
    name: "Study Notes",
    description: "Key points and definitions for learning",
    icon: "GraduationCap",
  },
  "meeting-notes": {
    name: "Meeting Notes",
    description: "Action items and decisions summary",
    icon: "Users",
  },
};

export const DEFAULT_TEMPLATE: SummaryTemplate = "detailed";
