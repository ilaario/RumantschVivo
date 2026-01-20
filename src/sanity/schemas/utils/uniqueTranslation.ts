import type { ValidationContext } from 'sanity';

export function uniqueByRefAndLocale(params: {
  type: string;
  refField: string;
  localeField?: string;
}) {
  const { type, refField, localeField = 'locale' } = params;

  // NON tipiamo rule come Rule, lo lasciamo any
  return (rule: any) =>
    rule.custom(async (_value: unknown, context: ValidationContext) => {
      const doc = context.document as
        | {
            _id?: string;
            [key: string]: unknown;
          }
        | undefined;

      if (!doc || typeof context.getClient !== 'function') return true;

      const ref = (doc[refField] as { _ref?: string } | undefined)?._ref;
      const locale = doc[localeField] as string | undefined;

      if (!ref || !locale) return true;

      const client = context.getClient({ apiVersion: '2024-01-01' });

      const currentId = (doc._id ?? '').replace(/^drafts\./, '');

      const query = `
        count(*[
          _type == $type &&
          ${refField}._ref == $ref &&
          ${localeField} == $locale &&
          !(_id in [$draftId, $publishedId])
        ])
      `;

      const existing = await client.fetch(query, {
        type,
        ref,
        locale,
        draftId: `drafts.${currentId}`,
        publishedId: currentId,
      });

      return existing > 0
        ? `Esiste già una traduzione per questo ${refField} e locale (${locale}).`
        : true;
    });
}