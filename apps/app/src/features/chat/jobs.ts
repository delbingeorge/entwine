import type { Job } from "./types";

export const jobs: Job[] = [];

export const jobById = (id: string) => jobs.find((job) => job.id === id);
