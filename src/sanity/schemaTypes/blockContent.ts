import { defineArrayMember, defineType } from 'sanity';

export default defineType({
  name: 'blockContent',
  title: 'Contenuto testuale',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragrafo', value: 'normal' },
        { title: 'Titolo 1', value: 'h1' },
        { title: 'Titolo 2', value: 'h2' },
        { title: 'Titolo 3', value: 'h3' },
        { title: 'Citazione', value: 'blockquote' },
      ],
      lists: [
        { title: 'Elenco puntato', value: 'bullet' },
        { title: 'Elenco numerato', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Grassetto', value: 'strong' },
          { title: 'Corsivo', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
            ],
          },
        ],
      },
    }),
  ],
});
