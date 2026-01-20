import { defineField, defineType } from 'sanity';
import { SUPPORTED_LOCALES, LOCALE_LABEL } from './utils/locales';
import { uniqueByRefAndLocale } from './utils/uniqueTranslation';

export const lessonTranslation = defineType({
  name: 'lessonTranslation',
  title: 'Lesson (Translation)',
  type: 'document',
  fields: [
    defineField({
      name: 'lesson',
      title: 'Lesson Base',
      type: 'reference',
      to: [{ type: 'lessonBase' }],
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
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],

  validation: (Rule) =>
    uniqueByRefAndLocale({
      type: 'lessonTranslation',
      refField: 'lesson',
      localeField: 'locale',
    })(Rule),

  preview: {
    select: {
      title: 'title',
      locale: 'locale',
      lessonKey: 'lesson.lessonKey',
      level: 'lesson.level',
      variant: 'lesson.variant',
    },
    prepare(sel) {
      return {
        title: sel.title || sel.lessonKey,
        subtitle: [sel.locale, sel.variant, sel.level, sel.lessonKey]
          .filter(Boolean)
          .join(' · '),
      };
    },
  },
});