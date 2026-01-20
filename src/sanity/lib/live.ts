// src/sanity/lib/live.ts
// Live content API per preview / modalità live

import { defineLive } from 'next-sanity/live';
import { sanityClient } from './client';

export const { sanityFetch, SanityLive } = defineLive({
  client: sanityClient,
});
