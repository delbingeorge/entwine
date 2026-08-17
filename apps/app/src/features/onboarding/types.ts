import { defaultCurrency } from "@/shared/lib/currencies";

export interface ProfileDraft {
  locations: string[];
  salaryCurrency: string;
  salaryMin: string;
  seniority: string[];
}

export const emptyDraft: ProfileDraft = {
  locations: [],
  salaryCurrency: defaultCurrency,
  salaryMin: "",
  seniority: [],
};
