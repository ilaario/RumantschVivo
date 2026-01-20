// ./schemas/index.ts
import { lessonBase } from './lessonBase';
import { lessonTranslation } from './lessonTranslation';
import { exerciseBase } from './exerciseBase';
import { exerciseTranslation } from './exerciseTranslation';
// aggiungi tutto il resto...

export const schemaTypes = [
  lessonBase,
  lessonTranslation,
  exerciseBase,
  exerciseTranslation,
  // ...altri tipi
];