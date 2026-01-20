import { defineField, defineType } from 'sanity';

export const exerciseBase = defineType({
  name: 'exerciseBase',
  title: 'Exercise (Base)',
  type: 'document',
  fields: [
    defineField({
      name: 'exerciseKey',
      title: 'Exercise Key',
      type: 'string',
      description: 'Chiave stabile (utile per debug, migrazioni, ecc.).',
      validation: (Rule) => Rule.required().min(3),
    }),

    defineField({
      name: 'lesson',
      title: 'Lesson Base',
      type: 'reference',
      to: [{ type: 'lessonBase' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(0),
    }),

    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Multiple choice', value: 'mcq' },
          { title: 'Open answer', value: 'open' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
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
      title: 'exerciseKey',
      lessonKey: 'lesson.lessonKey',
      order: 'order',
      type: 'type',
    },
    prepare(sel) {
      return {
        title: sel.title,
        subtitle: `${sel.lessonKey} · ${sel.type} · #${sel.order}`,
      };
    },
  },
});