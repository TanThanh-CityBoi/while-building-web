import type { Permission } from '@while-building/types';
import {
  IconArticle,
  IconDashboard,
  IconFolder,
  IconProject,
  IconSettings,
  IconUsers,
  type Icon,
} from '@/components/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  /** Hidden unless the user has this permission (UX only). */
  permission?: Permission;
  /** Only mark active on an exact match (for parents with their own children). */
  end?: boolean;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  {
    to: '/content',
    label: 'Content',
    icon: IconFolder,
    permission: 'CONTENT_READ',
    end: true,
    children: [
      { to: '/content/articles', label: 'Articles', icon: IconArticle, permission: 'CONTENT_READ' },
      { to: '/content/projects', label: 'Projects', icon: IconProject, permission: 'CONTENT_READ' },
    ],
  },
  { to: '/users', label: 'Users', icon: IconUsers, permission: 'USERS_READ' },
  { to: '/settings', label: 'Settings', icon: IconSettings },
];
