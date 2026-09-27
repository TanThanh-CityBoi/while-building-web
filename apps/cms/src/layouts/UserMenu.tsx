import { Avatar, Badge, Dropdown } from '@while-building/ui';
import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { IconChevronDown, IconLogOut, IconSettings } from '@/components/icons';
import { roleLabel } from '@/features/users/roles';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <Dropdown
      label={`Account menu for ${user.name}`}
      trigger={
        <>
          <Avatar name={user.name} size="sm" decorative />
          <span className={styles.name}>{user.name}</span>
          <IconChevronDown className={styles.chevron} />
        </>
      }
      header={
        <div className={styles.header}>
          <p className={styles.headerName}>{user.name}</p>
          <p className={styles.email}>{user.email}</p>
          <Badge tone="neutral">{roleLabel(user.role)}</Badge>
        </div>
      }
      items={[
        {
          id: 'settings',
          label: 'Settings',
          icon: <IconSettings />,
          onSelect: () => void navigate('/settings'),
        },
        { id: 'separator', separator: true },
        {
          id: 'logout',
          label: 'Log out',
          icon: <IconLogOut />,
          // The auth guard sends the signed-out user to /login.
          onSelect: () => void logout(),
        },
      ]}
    />
  );
}
