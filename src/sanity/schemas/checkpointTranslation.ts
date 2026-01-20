import { defineType, defineField } from 'sanity';
import { SUPPORTED_LOCALES, LOCALE_LABEL } from './utils/locales';
import { uniqueByRefAndLocale } from './utils/uniqueTranslation';

export const checkpointTranslation = defineType({
  name: 'checkpointTranslation',
  title: 'Checkpoint (Translation)',
  type: 'document',
  fields: [
    defineField({
      name: 'checkpoint',
      title: 'Checkpoint Base',
      type: 'reference',
      to: [{ type: 'checkpointBase' }],
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
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro text',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'outroPass',
      title: 'Outro (if passed)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'outroFail',
      title: 'Outro (if failed)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  validation: (rule) =>
    uniqueByRefAndLocale({
      type: 'checkpointTranslation',
      refField: 'checkpoint',
      localeField: 'locale',
    })(rule as any),
  preview: {
    select: {
      title: 'title',
      locale: 'locale',
      checkpointKey: 'checkpoint.checkpointKey',
      level: 'checkpoint.level',
    },
    prepare(sel) {
      return {
        title: sel.title,
        subtitle: `${sel.checkpointKey} · ${sel.locale} · ${sel.level}`,
      };
    },
  },
});