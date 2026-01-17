import { groq } from 'next-sanity';

// LISTA LEZIONI
export const lessonsListQuery = groq`
  *[_type == "lesson" && level == $level] | order(lessonKey asc) {
    _id,
    "slug": slug.current,
    level,
    // qui prendiamo l'oggetto intero, NON risolto
    title,
    goals
  }
`;

// DETTAGLIO LEZIONE
export const lessonBySlugQuery = groq`
  *[_type == "lesson" && slug.current == $slug][0]{
    _id,
    lessonKey,
    level,
    "slug": slug.current,
    // oggetti localizzati, li risolviamo in TS
    title,
    intro,
    body
  }
`;



export const exercisesByLessonQuery = groq`
  *[_type == "exercise" && lesson->lessonKey == $lessonKey]
    | order(order asc) {
      _id,
      exerciseKey,
      order,
      type,
      title,
      // portable text localizzato (lo risolviamo in TS)
      prompt,

      // --- MCQ ---
      choices[]{
        _key,
        text,
        correct
      },

      // --- OPEN ---
      expectedAnswer,
      solution
    }
`;