import type { Article, ContentStatus, Project } from '@while-building/types';
import { fetchArticles, fetchProjects } from '@/features/content/source';

// Dashboard data. Derived from the sample content today; replace with a dedicated API call
// (e.g. `GET /dashboard/metrics`) once the backend offers one — the page only sees these shapes.

export interface DashboardMetrics {
  articles: number;
  projects: number;
  drafts: number;
  published: number;
}

export interface RecentContentItem {
  id: string;
  type: 'Article' | 'Project';
  title: string;
  status: ContentStatus;
  updatedAt: string;
  href: string;
}

const countStatus = (items: Array<Article | Project>, status: ContentStatus) =>
  items.filter((item) => item.status === status).length;

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [articles, projects] = await Promise.all([fetchArticles(), fetchProjects()]);
  const all = [...articles, ...projects];
  return {
    articles: articles.length,
    projects: projects.length,
    drafts: countStatus(all, 'DRAFT'),
    published: countStatus(all, 'PUBLISHED'),
  };
}

export async function fetchRecentContent(limit = 5): Promise<RecentContentItem[]> {
  const [articles, projects] = await Promise.all([fetchArticles(), fetchProjects()]);
  return [
    ...articles.map((article) => ({
      id: article.id,
      type: 'Article' as const,
      title: article.title,
      status: article.status,
      updatedAt: article.updatedAt,
      href: '/content/articles',
    })),
    ...projects.map((project) => ({
      id: project.id,
      type: 'Project' as const,
      title: project.name,
      status: project.status,
      updatedAt: project.updatedAt,
      href: '/content/projects',
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}
