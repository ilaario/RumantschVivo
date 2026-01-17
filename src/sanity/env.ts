// src/sanity/lib/config.ts
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'TODO_PROJECT_ID';

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export const apiVersion = '2025-01-01';

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
