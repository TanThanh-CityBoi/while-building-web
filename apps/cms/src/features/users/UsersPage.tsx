import { getErrorMessage, isApiError } from '@while-building/api-client';
import type { AssignableRole, User, UserStatus } from '@while-building/types';
import { Avatar, AvatarFallback } from '@while-building/ui/components/avatar';
import { Button } from '@while-building/ui/components/button';
import { Card } from '@while-building/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@while-building/ui/components/dropdown-menu';
import { Input } from '@while-building/ui/components/input';
import { NativeSelect, NativeSelectOption } from '@while-building/ui/components/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@while-building/ui/components/table';
import { formatDate, getInitials, pluralize } from '@while-building/utils';
import {
  BanIcon,
  CircleCheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Page, PageHeader } from '@/components/Page';
import { Pagination } from '@/components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ToneBadge } from '@/components/ToneBadge';
import { Toolbar } from '@/components/Toolbar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ASSIGNABLE_ROLES, roleLabel, roleTone, statusLabel } from './roles';
import { useDeleteUser, useUpdateUserStatus, useUsers } from './queries';
import { UserFormDialog } from './UserFormDialog';

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
    <Page>
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
            <PlusIcon data-icon="inline-start" /> New user
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <Toolbar summary={users.data && pluralize(users.data.meta.total, 'user')}>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search by name or email…"
              aria-label="Search users"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <NativeSelect
            aria-label="Filter by role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as AssignableRole | '');
              setPage(1);
            }}
          >
            <NativeSelectOption value="">All roles</NativeSelectOption>
            {ASSIGNABLE_ROLES.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {roleLabel(option.value)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as UserStatus | '');
              setPage(1);
            }}
          >
            <NativeSelectOption value="">All statuses</NativeSelectOption>
            <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
            <NativeSelectOption value="DISABLED">Disabled</NativeSelectOption>
          </NativeSelect>
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
              icon={<UsersIcon />}
              title="No users match your filters"
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<UsersIcon />}
              title="No users yet"
              description="Invite editors and authors to help manage content."
              action={
                canCreate && (
                  <Button size="sm" onClick={() => setAction({ type: 'create' })}>
                    <PlusIcon data-icon="inline-start" /> New user
                  </Button>
                )
              }
            />
          )
        ) : (
          <>
            <Table aria-busy={users.isFetching || undefined}>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.data.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                  const statusReason = isSelf
                    ? "You can't disable your own account"
                    : 'Requires the USERS_UPDATE permission';
                  const deleteReason = isSelf
                    ? "You can't delete your own account"
                    : 'Requires the USERS_DELETE permission';
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">
                              {user.name}
                              {isSelf && (
                                <span className="font-normal text-muted-foreground"> (you)</span>
                              )}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ToneBadge tone={roleTone[user.role]}>{roleLabel(user.role)}</ToneBadge>
                      </TableCell>
                      <TableCell>
                        <ToneBadge dot tone={user.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {statusLabel[user.status]}
                        </ToneBadge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${user.name}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              disabled={!canUpdate}
                              title={canUpdate ? undefined : 'Requires the USERS_UPDATE permission'}
                              onClick={() => setAction({ type: 'edit', user })}
                            >
                              <PencilIcon /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!canUpdate || isSelf}
                              title={!canUpdate || isSelf ? statusReason : undefined}
                              onClick={() =>
                                setAction({ type: 'status', user, status: nextStatus })
                              }
                            >
                              {nextStatus === 'DISABLED' ? <BanIcon /> : <CircleCheckIcon />}
                              {nextStatus === 'DISABLED' ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={!canDelete || isSelf}
                              title={!canDelete || isSelf ? deleteReason : undefined}
                              onClick={() => setAction({ type: 'delete', user })}
                            >
                              <Trash2Icon /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
    </Page>
  );
}
