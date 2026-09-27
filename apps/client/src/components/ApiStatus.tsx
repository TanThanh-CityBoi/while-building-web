import { Badge, type BadgeTone } from '@while-building/ui';
import { useApiHealth, type ApiHealth } from '@/hooks/useApiHealth';
import { api } from '@/lib/api';

const display: Record<ApiHealth, { label: string; tone: BadgeTone }> = {
  unconfigured: { label: 'API not configured', tone: 'neutral' },
  checking: { label: 'Checking API…', tone: 'neutral' },
  online: { label: 'API online', tone: 'success' },
  degraded: { label: 'API degraded', tone: 'warning' },
  offline: { label: 'API offline', tone: 'danger' },
};

/** Small indicator of backend reachability via `GET /health`. Never blocks the page. */
export function ApiStatus() {
  const { label, tone } = display[useApiHealth()];

  return (
    <span title={api.baseUrl || 'Set VITE_API_URL to connect the API'}>
      <Badge variant="dot" tone={tone}>
        {label}
      </Badge>
    </span>
  );
}
