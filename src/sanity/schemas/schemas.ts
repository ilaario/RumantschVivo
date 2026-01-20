// ./schemas/index.ts
import { lessonBase } from './lessonBase';
import { lessonTranslation } from './lessonTranslation';
import { exerciseBase } from './exerciseBase';
import { exerciseTranslation } from './exerciseTranslation';
import { checkpointBase } from './checkpointBase';
import { checkpointTranslation } from './checkpointTranslation';

// aggiungi tutto il resto...

export const schemaTypes = [
  lessonBase,
  lessonTranslation,
  exerciseBase,
  exerciseTranslation,
  checkpointBase,
  checkpointTranslation
  // ...altri tipi
];