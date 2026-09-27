// Static content for the "Current Experiments" section on the home page.

export type ExperimentStatus = 'running' | 'paused' | 'planned';

export interface Experiment {
  title: string;
  description: string;
  status: ExperimentStatus;
}

export const experiments: Experiment[] = [
  {
    title: 'GitOps for the homelab',
    description:
      'Letting Argo CD reconcile everything in the cluster from a single Git repository.',
    status: 'running',
  },
  {
    title: 'This website',
    description:
      'A public site and an internal CMS in one frontend monorepo, talking to a separate backend API.',
    status: 'running',
  },
  {
    title: 'Database backups on k3s',
    description: 'Scheduled PostgreSQL backups, and actually testing the restore path.',
    status: 'planned',
  },
];
