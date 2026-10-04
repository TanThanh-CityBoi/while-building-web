import { useApiHealth, type ApiHealth } from '@/hooks/useApiHealth';
import { api } from '@/lib/api';
import { ToneBadge, type Tone } from './ToneBadge';

const display: Record<ApiHealth, { label: string; tone: Tone }> = {
  unconfigured: { label: 'API not configured', tone: 'neutral' },
  checking: { label: 'Checking API…', tone: 'neutral' },
  online: { label: 'API online', tone: 'success' },
  degraded: { label: 'API degraded', tone: 'warning' },
  offline: { label: 'API offline', tone: 'danger' },
};

export function ApiStatus() {
  const { label, tone } = display[useApiHealth()];
  return (
    <span title={api.baseUrl || 'Set VITE_API_URL to connect the API'}>
      <ToneBadge dot tone={tone}>
        {label}
      </ToneBadge>
    </span>
  );
}
