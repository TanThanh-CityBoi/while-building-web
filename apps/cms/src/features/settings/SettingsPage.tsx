import { PERMISSIONS } from '@while-building/types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
} from '@while-building/ui';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { ApiStatus } from '@/components/ApiStatus';
import { IconSettings } from '@/components/icons';
import { roleLabel } from '@/features/users/roles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/lib/api';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, can, refreshSession } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Your account and platform configuration." />

      <div className={styles.grid}>
        <Card>
          <CardHeader
            title="Profile"
            description="Profile editing will be available once the API supports it."
          />
          <dl className={styles.facts}>
            <div>
              <dt>Name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{user && <Badge tone="neutral">{roleLabel(user.role)}</Badge>}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader
            title="Session"
            description="Your session is kept in a secure cookie and refreshed automatically."
          />
          <dl className={styles.facts}>
            <div>
              <dt>API</dt>
              <dd className={styles.inline}>
                <ApiStatus />
                <code className={styles.code}>{api.baseUrl || 'not configured'}</code>
              </dd>
            </div>
          </dl>
          <Button
            variant="secondary"
            size="sm"
            className={styles.refresh}
            loading={refreshing}
            onClick={() => void refresh()}
          >
            Refresh session
          </Button>
        </Card>

        <Card className={styles.wide}>
          <CardHeader
            title="Your permissions"
            description="Granted by your role on the API. The CMS uses them to show or hide actions; the API enforces them."
          />
          <ul role="list" className={styles.permissions}>
            {PERMISSIONS.map((permission) => (
              <li key={permission}>
                <Badge tone={can(permission) ? 'success' : 'neutral'} variant="dot">
                  {permission}
                </Badge>
                <span className="visually-hidden">
                  {can(permission) ? ' (granted)' : ' (not granted)'}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.wide} padding="none">
          <EmptyState
            icon={<IconSettings />}
            title="Platform settings"
            description="Site metadata, publishing defaults and integrations will be configured here."
          />
        </Card>
      </div>
    </PageContainer>
  );
}
