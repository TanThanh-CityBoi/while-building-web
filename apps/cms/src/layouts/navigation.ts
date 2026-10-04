import type { Permission } from '@while-building/types';
import {
  FileTextIcon,
  FolderKanbanIcon,
  FolderOpenIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Hidden unless the user has this permission (UX only). */
  permission?: Permission;
  /** Only mark active on an exact match (for parents with their own children). */
  end?: boolean;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  {
    to: '/content',
    label: 'Content',
    icon: FolderOpenIcon,
    permission: 'CONTENT_READ',
    end: true,
    children: [
      {
        to: '/content/articles',
        label: 'Articles',
        icon: FileTextIcon,
        permission: 'CONTENT_READ',
      },
      {
        to: '/content/projects',
        label: 'Projects',
        icon: FolderKanbanIcon,
        permission: 'CONTENT_READ',
      },
    ],
  },
  { to: '/assistant', label: 'Assistant', icon: SparklesIcon, permission: 'CONTENT_READ' },
  { to: '/users', label: 'Users', icon: UsersIcon, permission: 'USERS_READ' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];
