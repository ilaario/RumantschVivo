// src/lib/content/tasks.ts

import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type RoadmapTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  order: number;
};

const tasksQuery = groq`
  *[_type == "task"]
  | order(order asc, _createdAt asc) {
    _id,
    title,
    description,
    status,
    order
  }
`;

export async function listRoadmapTasks(): Promise<RoadmapTask[]> {
  const rows = await sanityClient.fetch<any[]>(tasksQuery);

  return (rows ?? []).map((row) => ({
    id: row._id as string,
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    status: (row.status ?? 'todo') as TaskStatus,
    order: typeof row.order === 'number' ? row.order : 0,
  }));
}