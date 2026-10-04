import { Separator } from '@while-building/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@while-building/ui/components/sidebar';
import { Outlet } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';

/** Authenticated shell: collapsible sidebar (a sheet on phones), top bar, page. */
export function AppLayout() {
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur sm:px-4">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <span className="font-mono text-xs text-muted-foreground">While Building CMS</span>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
