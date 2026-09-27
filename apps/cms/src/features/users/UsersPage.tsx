import { getErrorMessage, isApiError } from '@while-building/api-client';
import type { AssignableRole, User, UserStatus } from '@while-building/types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageContainer,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@while-building/ui';
import { formatDate, pluralize } from '@while-building/utils';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  IconBan,
  IconCheckCircle,
  IconMore,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsers,
} from '@/components/icons';
import { Pagination } from '@/components/Pagination';
import { Toolbar } from '@/components/Toolbar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ASSIGNABLE_ROLES, roleLabel, roleTone, statusLabel } from './roles';
import { useDeleteUser, useUpdateUserStatus, useUsers } from './queries';
import { UserFormDialog } from './UserFormDialog';
import styles from './UsersPage.module.css';

const PAGE_SIZE = 20;

type PendingAction =
  | { type: 'create' }
  | { type: 'edit'; user: User }
  | { type: 'status'; user: User; status: UserStatus }
  | { type: 'delete'; user: User };

export function UsersPage() {
  useDocumentTitle('Users');
  const { user: currentUser, can } = useAuth();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<AssignableRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<PendingAction | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const users = useUsers({
    search: debouncedSearch || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const hasFilters = Boolean(search || role || status);
  const resetFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
  };

  const canCreate = can('USERS_CREATE');
  const canUpdate = can('USERS_UPDATE');
  const canDelete = can('USERS_DELETE');
  const close = () => setAction(null);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Manage who can sign in to the CMS and which role they have."
        actions={
          <Button
            onClick={() => setAction({ type: 'create' })}
            disabled={!canCreate}
            title={canCreate ? undefined : 'Requires the USERS_CREATE permission'}
          >
            <IconPlus /> New user
          </Button>
        }
      />

      <Card padding="none">
        <Toolbar summary={users.data && pluralize(users.data.meta.total, 'user')}>
          <Input
            type="search"
            controlSize="sm"
            placeholder="Search by name or email…"
            aria-label="Search users"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            controlSize="sm"
            aria-label="Filter by role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as AssignableRole | '');
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {ASSIGNABLE_ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {roleLabel(option.value)}
              </option>
            ))}
          </Select>
          <Select
            controlSize="sm"
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as UserStatus | '');
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </Select>
        </Toolbar>

        {users.isPending ? (
          <LoadingState label="Loading users…" />
        ) : users.isError ? (
          <ErrorState
            title={
              isApiError(users.error) && users.error.status === 403
                ? "You don't have permission to list users"
                : "Couldn't load users"
            }
            description={getErrorMessage(users.error)}
            onRetry={() => void users.refetch()}
          />
        ) : users.data.data.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={<IconUsers />}
              title="No users match your filters"
              action={
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<IconUsers />}
              title="No users yet"
              description="Invite editors and authors to help manage content."
              action={
                canCreate && (
                  <Button size="sm" onClick={() => setAction({ type: 'create' })}>
                    <IconPlus /> New user
                  </Button>
                )
              }
            />
          )
        ) : (
          <>
            <TableContainer>
              <Table aria-busy={users.isFetching || undefined}>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell align="end">
                      <span className="visually-hidden">Actions</span>
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.data.data.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className={styles.user}>
                            <Avatar name={user.name} size="sm" decorative />
                            <div className={styles.userText}>
                              <span className={styles.name}>
                                {user.name}
                                {isSelf && <span className={styles.you}> (you)</span>}
                              </span>
                              <span className={styles.email}>{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={roleTone[user.role]}>{roleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="dot"
                            tone={user.status === 'ACTIVE' ? 'success' : 'neutral'}
                          >
                            {statusLabel[user.status]}
                          </Badge>
                        </TableCell>
                        <TableCell muted>
                          <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
                        </TableCell>
                        <TableCell align="end">
                          <Dropdown
                            label={`Actions for ${user.name}`}
                            trigger={<IconMore />}
                            items={[
                              {
                                id: 'edit',
                                label: 'Edit',
                                icon: <IconPencil />,
                                disabled: !canUpdate,
                                disabledReason: 'Requires the USERS_UPDATE permission',
                                onSelect: () => setAction({ type: 'edit', user }),
                              },
                              {
                                id: 'status',
                                label: nextStatus === 'DISABLED' ? 'Disable' : 'Enable',
                                icon: nextStatus === 'DISABLED' ? <IconBan /> : <IconCheckCircle />,
                                disabled: !canUpdate || isSelf,
                                disabledReason: isSelf
                                  ? "You can't disable your own account"
                                  : 'Requires the USERS_UPDATE permission',
                                onSelect: () =>
                                  setAction({ type: 'status', user, status: nextStatus }),
                              },
                              { id: 'separator', separator: true },
                              {
                                id: 'delete',
                                label: 'Delete',
                                icon: <IconTrash />,
                                tone: 'danger',
                                disabled: !canDelete || isSelf,
                                disabledReason: isSelf
                                  ? "You can't delete your own account"
                                  : 'Requires the USERS_DELETE permission',
                                onSelect: () => setAction({ type: 'delete', user }),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {users.data.meta.totalPages > 1 && (
              <Pagination
                meta={users.data.meta}
                onPageChange={setPage}
                disabled={users.isFetching}
              />
            )}
          </>
        )}
      </Card>

      <UserFormDialog
        open={action?.type === 'create' || action?.type === 'edit'}
        user={action?.type === 'edit' ? action.user : undefined}
        onClose={close}
      />

      <ConfirmDialog
        open={action?.type === 'status'}
        onClose={close}
        title={
          action?.type === 'status'
            ? `${action.status === 'DISABLED' ? 'Disable' : 'Enable'} ${action.user.name}?`
            : ''
        }
        description={
          action?.type === 'status' && action.status === 'DISABLED'
            ? "They won't be able to sign in until the account is enabled again."
            : 'They will be able to sign in again with their existing password.'
        }
        confirmLabel={
          action?.type === 'status' && action.status === 'DISABLED' ? 'Disable user' : 'Enable user'
        }
        tone={action?.type === 'status' && action.status === 'DISABLED' ? 'danger' : 'default'}
        onConfirm={() =>
          action?.type === 'status'
            ? updateStatus.mutateAsync({ id: action.user.id, status: action.status })
            : undefined
        }
      />

      <ConfirmDialog
        open={action?.type === 'delete'}
        onClose={close}
        title={action?.type === 'delete' ? `Delete ${action.user.name}?` : ''}
        description="This permanently removes the account and can’t be undone."
        confirmLabel="Delete user"
        tone="danger"
        onConfirm={() =>
          action?.type === 'delete' ? deleteUser.mutateAsync(action.user.id) : undefined
        }
      />
    </PageContainer>
  );
}
