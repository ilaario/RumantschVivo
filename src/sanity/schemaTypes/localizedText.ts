import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'localizedText',
  title: 'Testo localizzato',
  type: 'object',
  fields: [
    defineField({
      name: 'it',
      title: 'Italiano',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(3).warning('Scrivi qualcosa in italiano'),
    }),
    defineField({
      name: 'en',
      title: 'Inglese',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(3).warning('Scrivi qualcosa in inglese'),
    }),
  ],
});
