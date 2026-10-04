import { PERMISSIONS } from '@while-building/types';
import { Button } from '@while-building/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@while-building/ui/components/card';
import { Spinner } from '@while-building/ui/components/spinner';
import { SettingsIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/auth/useAuth';
import { ApiStatus } from '@/components/ApiStatus';
import { Page, PageHeader } from '@/components/Page';
import { EmptyState } from '@/components/States';
import { ToneBadge } from '@/components/ToneBadge';
import { roleLabel } from '@/features/users/roles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/lib/api';

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] items-center gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-2">{children}</dd>
    </div>
  );
}

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
    <Page>
      <PageHeader title="Settings" description="Your account and platform configuration." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Profile</h2>
            </CardTitle>
            <CardDescription>
              Profile editing will be available once the API supports it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <Fact label="Name">{user?.name}</Fact>
              <Fact label="Email">
                <span className="truncate">{user?.email}</span>
              </Fact>
              <Fact label="Role">{user && <ToneBadge>{roleLabel(user.role)}</ToneBadge>}</Fact>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Session</h2>
            </CardTitle>
            <CardDescription>
              Your session is kept in a secure cookie and refreshed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <Fact label="API">
                <ApiStatus />
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {api.baseUrl || 'not configured'}
                </code>
              </Fact>
            </dl>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              {refreshing && <Spinner data-icon="inline-start" />}
              Refresh session
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2>Your permissions</h2>
            </CardTitle>
            <CardDescription>
              Granted by your role on the API. The CMS uses them to show or hide actions; the API
              enforces them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul role="list" className="flex flex-wrap gap-2">
              {PERMISSIONS.map((permission) => (
                <li key={permission}>
                  <ToneBadge
                    dot
                    tone={can(permission) ? 'success' : 'neutral'}
                    className="font-mono"
                  >
                    {permission}
                  </ToneBadge>
                  <span className="sr-only">
                    {can(permission) ? ' (granted)' : ' (not granted)'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <EmptyState
            icon={<SettingsIcon />}
            title="Platform settings"
            description="Site metadata, publishing defaults and integrations will be configured here."
          />
        </Card>
      </div>
    </Page>
  );
}
