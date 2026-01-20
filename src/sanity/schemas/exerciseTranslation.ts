import { defineField, defineType } from 'sanity';
import { SUPPORTED_LOCALES, LOCALE_LABEL } from './utils/locales';
import { uniqueByRefAndLocale } from './utils/uniqueTranslation';

export const exerciseTranslation = defineType({
  name: 'exerciseTranslation',
  title: 'Exercise (Translation)',
  type: 'document',
  fields: [
    defineField({
      name: 'exercise',
      title: 'Exercise Base',
      type: 'reference',
      to: [{ type: 'exerciseBase' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'locale',
      title: 'Locale',
      type: 'string',
      options: {
        list: SUPPORTED_LOCALES.map((l) => ({
          title: LOCALE_LABEL[l],
          value: l,
        })),
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),

    defineField({
      name: 'prompt',
      title: 'Prompt',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'choices',
      title: 'Choices (MCQ)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'choice',
          fields: [
            defineField({
              name: 'id',
              title: 'Choice ID',
              type: 'string',
              description: 'ID stabile dentro l’esercizio (es: a, b, c).',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'correct',
              title: 'Correct',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
    }),

    defineField({
      name: 'expectedAnswer',
      title: 'Expected Answer (Open)',
      type: 'string',
      description: 'Risposta breve attesa (se vuoi confronto esatto).',
    }),

    defineField({
      name: 'solution',
      title: 'Solution (Open)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Soluzione mostrata quando la risposta non coincide.',
    }),
  ],

  // 👇 QUI il trucco: wrapper che prende Rule, e poi chiama il nostro helper
  validation: (Rule) =>
    uniqueByRefAndLocale({
      type: 'exerciseTranslation',
      refField: 'exercise',
      localeField: 'locale',
    })(Rule),

  preview: {
    select: {
      title: 'title',
      locale: 'locale',
      exerciseKey: 'exercise.exerciseKey',
      lessonKey: 'exercise.lesson.lessonKey',
      order: 'exercise.order',
      type: 'exercise.type',
    },
    prepare(sel) {
      return {
        title: sel.title,
        subtitle: `${sel.exerciseKey} · ${sel.locale} · ${sel.lessonKey} · ${sel.type} · #${sel.order}`,
      };
    },
  },
});