import { defineType } from 'sanity';

export default defineType({
  name: 'localizedString',
  title: 'Testo (it/en)',
  type: 'object',
  fields: [
    {
      name: 'it',
      title: 'Italiano',
      type: 'string',
    },
    {
      name: 'en',
      title: 'Inglese',
      type: 'string',
    },
  ],
});
