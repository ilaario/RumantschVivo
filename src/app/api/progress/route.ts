import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonKey = searchParams.get('lessonKey');
  const locale = searchParams.get('locale') ?? 'it';

  if (!lessonKey) {
    return NextResponse.json({ error: 'Missing lessonKey' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) return NextResponse.json({ currentIndex: 0, completed: false });

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('current_index, completed')
    .eq('user_id', user.id)
    .eq('lesson_key', lessonKey)
    .eq('locale', locale)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    currentIndex: data?.current_index ?? 0,
    completed: data?.completed ?? false,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lessonKey = body?.lessonKey as string | undefined;
  const locale = (body?.locale as string | undefined) ?? 'it';
  const currentIndex = body?.currentIndex as number | undefined;
  const completed = !!body?.completed;

  if (!lessonKey || typeof currentIndex !== 'number') {
    return NextResponse.json({ error: 'Missing lessonKey/currentIndex' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_key: lessonKey,
      locale,
      current_index: currentIndex,
      completed,
    },
    { onConflict: 'user_id,lesson_key,locale' },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
