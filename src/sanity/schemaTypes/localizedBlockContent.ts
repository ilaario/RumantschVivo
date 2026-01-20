import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'localizedBlockContent',
  title: 'Testo localizzato (rich)',
  type: 'object',
  fields: [
    defineField({ name: 'it', title: 'Italiano', type: 'blockContent' }),
    defineField({ name: 'en', title: 'Inglese', type: 'blockContent' }),
  ],
});
