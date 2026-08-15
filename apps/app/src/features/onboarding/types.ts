export interface ProfileDraft {
  seniority: string[];
  stack: string[];
  locations: string[];
  salaryMin: string;
  wantsToBuild: string;
}

export const emptyDraft: ProfileDraft = {
  seniority: [],
  stack: [],
  locations: [],
  salaryMin: "",
  wantsToBuild: "",
};
