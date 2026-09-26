import type { Experiment } from '@/types/content';

// Mock data for the "Current Experiments" section on the home page.
export const experiments: Experiment[] = [
  {
    title: 'GitOps for the homelab',
    description:
      'Letting Argo CD reconcile everything in the cluster from a single Git repository.',
    status: 'running',
  },
  {
    title: 'This website',
    description: 'A React frontend talking to a separate backend API — built in the open.',
    status: 'running',
  },
  {
    title: 'Database backups on k3s',
    description: 'Scheduled PostgreSQL backups, and actually testing the restore path.',
    status: 'planned',
  },
];
