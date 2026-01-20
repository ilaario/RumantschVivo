import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessonKey, locale, completed, lastIndex } = body ?? {};

    if (!lessonKey || !locale) {
      return NextResponse.json({ error: 'Missing lessonKey/locale' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // completed: boolean
    // lastIndex: number | null (progress esercizi)
    const payload: any = {
      user_id: user.id,
      lesson_key: lessonKey,
      locale,
      completed: !!completed,
      updated_at: new Date().toISOString(),
    };

    if (typeof lastIndex === 'number') payload.last_index = lastIndex;

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_key,locale' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
