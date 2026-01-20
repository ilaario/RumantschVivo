// src/sanity/lib/client.ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
});

/**
 * Se ti serve un client autenticato (es. preview / server-side con token),
 * puoi fare:
 *
 * export const sanityTokenClient =
 *   process.env.SANITY_API_READ_TOKEN
 *     ? sanityClient.withConfig({ token: process.env.SANITY_API_READ_TOKEN })
 *     : sanityClient;
 */