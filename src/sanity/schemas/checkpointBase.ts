import { defineType, defineField } from 'sanity';

export const checkpointBase = defineType({
  name: 'checkpointBase',
  title: 'Checkpoint (Base)',
  type: 'document',
  fields: [
    defineField({
      name: 'checkpointKey',
      title: 'Checkpoint Key',
      type: 'string',
      validation: (Rule) => Rule.required().regex(/^[A-Z0-9_\-]+$/),
      description: 'Es: CHECKPOINT_A0_FINAL',
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
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order in level',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'checkpointKey',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'minScore',
      title: 'Minimum score to pass (%)',
      type: 'number',
      initialValue: 70,
      validation: (Rule) => Rule.min(0).max(100),
    }),

    // testo non localizzato (verrà tradotto in checkpointTranslation)
    defineField({
      name: 'title',
      title: 'Internal title (base)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'exercises',
      title: 'Exercises',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'exerciseBase' }],
        },
      ],
      validation: (Rule) => Rule.min(1),
      description: 'Lista di exerciseBase che compongono il checkpoint',
    }),
  ],
});