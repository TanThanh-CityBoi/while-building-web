import { apiBaseUrl } from '@/api/client';
import { useApiHealth, type ApiHealth } from '@/hooks/useApiHealth';
import { StatusIndicator, type StatusTone } from './StatusIndicator';

const display: Record<ApiHealth, { label: string; tone: StatusTone }> = {
  unconfigured: { label: 'API not configured', tone: 'neutral' },
  checking: { label: 'Checking API…', tone: 'neutral' },
  online: { label: 'API online', tone: 'success' },
  offline: { label: 'API offline', tone: 'danger' },
};

/** Small indicator of backend reachability via `GET /health`. Never blocks the page. */
export function ApiStatus() {
  const health = useApiHealth();
  const { label, tone } = display[health];

  return (
    <span title={apiBaseUrl || 'Set VITE_API_URL to connect the API'}>
      <StatusIndicator tone={tone}>{label}</StatusIndicator>
    </span>
  );
}
