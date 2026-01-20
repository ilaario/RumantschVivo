import { defineField, defineType } from 'sanity';

export const lessonBase = defineType({
  name: 'lessonBase',
  title: 'Lesson (Base)',
  type: 'document',
  fields: [
    defineField({
      name: 'lessonKey',
      title: 'Lesson Key',
      type: 'string',
      description: 'Chiave stabile usata anche in Supabase (lesson_progress.lesson_key).',
      validation: (Rule) => Rule.required().min(3),
    }),

    defineField({
        name: 'slug',
        title: 'Lesson Slug',
        type: 'string',
        description: 'Chiave per recupero link href.',
        validation: (Rule) => Rule.required().min(3),
      }),

    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Sursilvan', value: 'sursilvan' },
          { title: 'Vallader', value: 'vallader' },
          { title: 'Surmiran', value: 'surmiran' },
          { title: 'Puter', value: 'puter' },
          { title: 'Sutsilvan', value: 'sutsilvan' },
          { title: 'Rumantsch Grischun', value: 'grischun' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          { title: 'A0', value: 'A0' },
          { title: 'A1', value: 'A1' },
          { title: 'A2', value: 'A2' },
          { title: 'B1', value: 'B1' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Ordine di visualizzazione nel livello.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),

    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'lessonKey',
      level: 'level',
      variant: 'variant',
      order: 'order',
    },
    prepare(sel) {
      return {
        title: sel.title,
        subtitle: `${sel.variant} · ${sel.level} · #${sel.order}`,
      };
    },
  },
});