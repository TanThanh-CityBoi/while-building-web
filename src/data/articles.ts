import type { Article } from '@/types/content';

// Mock data. Dates and reading times are placeholders until real articles exist.
const allArticles: Article[] = [
  {
    slug: 'running-postgresql-on-a-kubernetes-homelab',
    title: 'Running PostgreSQL on a Kubernetes Homelab',
    description: 'What I learned while running PostgreSQL on a small Kubernetes homelab.',
    category: 'DevOps',
    publishedAt: '2026-09-12',
    readingTimeMinutes: 9,
  },
  {
    slug: 'building-a-nestjs-api-from-scratch',
    title: 'Building a NestJS API from Scratch',
    description: 'Notes and lessons from building a backend with NestJS.',
    category: 'Backend',
    publishedAt: '2026-08-27',
    readingTimeMinutes: 12,
  },
  {
    slug: 'what-i-learned-running-my-first-k3s-cluster',
    title: 'What I Learned Running My First k3s Cluster',
    description: 'Things I learned while experimenting with k3s on a Mini PC.',
    category: 'Kubernetes',
    publishedAt: '2026-08-09',
    readingTimeMinutes: 7,
  },
  {
    slug: 'things-i-broke-while-building-my-homelab',
    title: 'Things I Broke While Building My Homelab',
    description: 'A collection of failures, debugging sessions and lessons learned.',
    category: 'Homelab',
    publishedAt: '2026-07-21',
    readingTimeMinutes: 10,
  },
];

/** All articles, newest first. */
export const articles = [...allArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const recentArticles = articles.slice(0, 3);
