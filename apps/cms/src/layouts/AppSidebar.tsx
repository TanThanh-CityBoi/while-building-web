import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@while-building/ui/components/sidebar';
import { Link, NavLink, useMatch } from 'react-router';
import { filterByPermission } from '@/auth/permissions';
import { useAuth } from '@/auth/useAuth';
import { ApiStatus } from '@/components/ApiStatus';
import { navigation, type NavItem } from './navigation';

function useIsActive(item: NavItem): boolean {
  return useMatch({ path: item.to, end: item.end ?? false }) !== null;
}

function NavEntry({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const active = useIsActive(item);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={item.label}
        render={<NavLink to={item.to} end={item.end} onClick={onNavigate} />}
      >
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {item.children && (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <NavSubEntry key={child.to} item={child} onNavigate={onNavigate} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

function NavSubEntry({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const active = useIsActive(item);
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={active}
        render={<NavLink to={item.to} end={item.end} onClick={onNavigate} />}
      >
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export function AppSidebar() {
  const { can } = useAuth();
  const { setOpenMobile } = useSidebar();
  const items = filterByPermission(navigation, can);
  const closeOnMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/dashboard" onClick={closeOnMobile} />}
              className="font-semibold"
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-sm text-primary-foreground"
              >
                &gt;_
              </span>
              <span className="truncate">While Building</span>
              <span className="ml-auto font-mono text-[0.65rem] tracking-wider text-brand uppercase">
                CMS
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Main">
              <SidebarMenu>
                {items.map((item) => (
                  <NavEntry key={item.to} item={item} onNavigate={closeOnMobile} />
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <ApiStatus />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
