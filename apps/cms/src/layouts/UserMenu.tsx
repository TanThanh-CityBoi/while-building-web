import { Avatar, AvatarFallback } from '@while-building/ui/components/avatar';
import { Button } from '@while-building/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@while-building/ui/components/dropdown-menu';
import { getInitials } from '@while-building/utils';
import { ChevronDownIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { ToneBadge } from '@/components/ToneBadge';
import { roleLabel } from '@/features/users/roles';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 px-1.5"
            aria-label={`Account menu for ${user.name}`}
          />
        }
      >
        <Avatar className="size-6">
          <AvatarFallback className="text-[0.65rem]">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-1 font-normal">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <ToneBadge>{roleLabel(user.role)}</ToneBadge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void navigate('/settings')}>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* The auth guard sends the signed-out user to /login. */}
        <DropdownMenuItem onClick={() => void logout()}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
