// src/sanity/schemaTypes/index.ts
import localizedString from './localizedString';
import localizedBlockContent from './localizedBlockContent';
import lesson from './lesson';
import exercise from './exercise';
import blockContent from './blockContent';

export const schemaTypes = [
  blockContent,            // <-- QUESTO ti manca
  localizedString,
  localizedBlockContent,
  lesson,
  exercise,
];

export const schema = {
  types: schemaTypes,
};