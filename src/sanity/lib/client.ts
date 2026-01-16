import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

if (!projectId || !dataset) {
  throw new Error('Missing Sanity projectId or dataset. Check src/sanity/env.ts');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // metti true in prod se i dati possono essere cached
});