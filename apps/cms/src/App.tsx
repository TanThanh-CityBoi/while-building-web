import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@while-building/ui/components/sonner';
import { TooltipProvider } from '@while-building/ui/components/tooltip';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from '@/auth/AuthProvider';
import { api } from '@/lib/api';
import { createQueryClient } from '@/lib/queryClient';
import { router } from '@/router';

const queryClient = createQueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider api={api}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
