// sanity/schemas/task.ts
import { defineType, defineField } from 'sanity';

export const task = defineType({
  name: 'task',
  title: 'Roadmap task',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: 'description',
      title: 'Descrizione',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'status',
      title: 'Stato',
      type: 'string',
      options: {
        list: [
          { title: 'Da fare', value: 'todo' },
          { title: 'In corso', value: 'in_progress' },
          { title: 'Fatto', value: 'done' },
          { title: 'Bloccato', value: 'blocked' },
        ],
        layout: 'radio',
      },
      initialValue: 'todo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Ordine',
      type: 'number',
      description: 'Per ordinare manualmente le task nella pagina Status',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
    },
    prepare({ title, status }) {
      const statusLabel =
        status === 'done'
          ? '✅'
          : status === 'in_progress'
            ? '🛠️'
            : status === 'blocked'
              ? '⛔'
              : '📝';

      return {
        title: `${statusLabel} ${title}`,
      };
    },
  },
});