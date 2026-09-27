import type { ProjectStage } from '@while-building/types';
import type { BadgeTone } from '@while-building/ui';

export const stageTone: Record<ProjectStage, BadgeTone> = {
  active: 'success',
  experimental: 'warning',
  archived: 'neutral',
};
