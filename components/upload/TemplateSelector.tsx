"use client";

import { SummaryTemplate, TEMPLATES, DEFAULT_TEMPLATE } from "@/types/templates";
import { Briefcase, FileText, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  Briefcase,
  FileText,
  GraduationCap,
  Users,
};

interface TemplateSelectorProps {
  selectedTemplate: SummaryTemplate;
  onTemplateChange: (template: SummaryTemplate) => void;
  disabled?: boolean;
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
  disabled = false,
}: TemplateSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Summary Style
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(TEMPLATES) as SummaryTemplate[]).map((templateKey) => {
          const template = TEMPLATES[templateKey];
          const Icon = iconMap[template.icon as keyof typeof iconMap];
          const isSelected = selectedTemplate === templateKey;

          return (
            <button
              key={templateKey}
              type="button"
              disabled={disabled}
              onClick={() => onTemplateChange(templateKey)}
              className={cn(
                "flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left",
                "hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20",
                isSelected
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isSelected ? "text-rose-600" : "text-gray-500"
                  )}
                />
                <span
                  className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-rose-700 dark:text-rose-400" : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {template.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {template.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
