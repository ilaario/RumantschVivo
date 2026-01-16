// src/sanity/schemaTypes/exercise.ts
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'exercise',
  title: 'Esercizio',
  type: 'document',
  fields: [
    defineField({
      name: 'lesson',
      title: 'Lezione',
      type: 'reference',
      to: [{ type: 'lesson' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'exerciseKey',
      title: 'Exercise Key',
      type: 'string',
      description: 'Chiave tecnica, es: a0_intro_1_ex1',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z0-9_\-]+$/, {
          name: 'slug-style',
        }),
    }),
    defineField({
      name: 'order',
      title: 'Ordine nella lezione',
      type: 'number',
    }),
    defineField({
      name: 'type',
      title: 'Tipo di esercizio',
      type: 'string',
      options: {
        list: [
          { title: 'Scelta multipla', value: 'mcq' },
          { title: 'Testo aperto', value: 'open' },
          { title: 'Riordina / abbina', value: 'ordering' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titolo breve',
      type: 'localizedString',
    }),
    defineField({
      name: 'prompt',
      title: 'Consegna / testo',
      type: 'localizedBlockContent',
      description:
        'Testo esercizio (domanda, spiegazione, frasi da completare, ecc.)',
    }),
    defineField({
      name: 'choices',
      title: 'Opzioni (per scelta multipla)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'choice',
          fields: [
            {
              name: 'text',
              title: 'Testo opzione',
              type: 'localizedString',
            },
            {
              name: 'correct',
              title: 'Corretta',
              type: 'boolean',
            },
          ],
          preview: {
            select: {
              titleIt: 'text.it',
              titleEn: 'text.en',
              correct: 'correct',
            },
            prepare({ titleIt, titleEn, correct }) {
              return {
                title: titleIt || titleEn || '(vuota)',
                subtitle: correct ? 'Corretta' : 'Errata',
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'solution',
      title: 'Soluzione / spiegazione',
      type: 'localizedBlockContent',
    }),
  ],
  preview: {
    select: {
      titleIt: 'title.it',
      titleEn: 'title.en',
      type: 'type',
      lessonKey: 'lesson.lessonKey',
      order: 'order',
    },
    prepare({ titleIt, titleEn, type, lessonKey, order }) {
      const title = titleIt || titleEn || `Esercizio ${order ?? ''}`.trim();
      const subtitleParts = [
        type ? `Tipo: ${type}` : null,
        lessonKey ? `Lezione: ${lessonKey}` : null,
      ].filter(Boolean);

      return {
        title,
        subtitle: subtitleParts.join(' · '),
      };
    },
  },
});