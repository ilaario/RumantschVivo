export type LessonVariant = 'sursilvan';
export type LessonLevel = 'A0' | 'A1' | 'A2';

export type LessonBlock =
  | { type: 'explain'; title: string; text: string }
  | { type: 'examples'; items: { rm: string; it: string }[] }
  | {
      type: 'exercises';
      items: {
        kind: 'mcq';
        question: string;
        options: string[];
        answerIndex: number;
      }[];
    };

export type Lesson = {
  id: string;
  variant: LessonVariant;
  level: LessonLevel;
  slug: string;
  title: string;
  goals: string[];
  content: LessonBlock[];
};
