import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n/config';

export type LessonProgressMap = Record<
  string,
  {
    completed: boolean;
    currentIndex: number;
  }
>;

export async function getLessonProgressMap(
  lessonKeys: string[],
  locale: Locale,
): Promise<LessonProgressMap> {
  if (lessonKeys.length === 0) return {};

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_key, completed, current_index')
    .eq('locale', locale)
    .in('lesson_key', lessonKeys);

  if (error || !data) {
    console.error('[getLessonProgressMap]', error);
    return {};
  }

  const map: LessonProgressMap = {};
  for (const row of data) {
    map[row.lesson_key] = {
      completed: row.completed,
      currentIndex: row.current_index,
    };
  }

  return map;
}
