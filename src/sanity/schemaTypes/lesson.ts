import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'lesson',
  title: 'Lezione',
  type: 'document',
  fields: [
    defineField({
      name: 'lessonKey',
      title: 'Lesson Key',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^[a-z0-9_\-]+$/, {
            name: 'slug-style',
            invert: false,
          })
          .warning(
            'Usa solo minuscole, numeri, - e _. Deve combaciare con il lesson_key in Supabase.',
          ),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (studio)',
      type: 'slug',
      options: {
        source: 'lessonKey',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'variant',
      title: 'Variante',
      type: 'string',
      options: {
        list: [
          { title: 'Sursilvan', value: 'sursilvan' },
          // aggiungi qui altre varianti quando ti servono
          // { title: 'Vallader', value: 'vallader' },
          // { title: 'Puter', value: 'puter' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Seleziona una variante'),
    }),

    defineField({
      name: 'level',
      title: 'Livello',
      type: 'string',
      options: {
        list: [
          { title: 'A0', value: 'A0' },
          { title: 'A1', value: 'A1' },
          { title: 'A2', value: 'A2' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Seleziona un livello'),
    }),

    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Introduzione',
      type: 'localizedBlockContent',
    }),
    defineField({
      name: 'body',
      title: 'Testo lezione',
      type: 'localizedBlockContent',
    }),
  ],
  preview: {
    select: {
      titleIt: 'title.it',
      titleEn: 'title.en',
      level: 'level',
      variant: 'variant',
      lessonKey: 'lessonKey',
    },
    prepare({ titleIt, titleEn, level, variant, lessonKey }) {
      return {
        title: titleIt || titleEn || lessonKey || 'Lezione senza titolo',
        subtitle: [variant, level, lessonKey].filter(Boolean).join(' · '),
      };
    },
  },
});
