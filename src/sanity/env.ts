// src/sanity/env.ts

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = '2024-01-01';

if (!projectId || !dataset) {
  // Meglio fail-fast in dev
  console.warn('[sanity/env] Missing NEXT_PUBLIC_SANITY_PROJECT_ID or DATASET');
}