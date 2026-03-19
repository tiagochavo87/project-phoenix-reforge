import { Bluetooth, BluetoothOff, Loader2, AlertCircle } from 'lucide-react';
import type { ConnectionStatus } from '@/types/ring';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  className?: string;
}

const config: Record<ConnectionStatus, { icon: any; label: string; cssClass: string }> = {
  connected: { icon: Bluetooth, label: 'Connected', cssClass: 'ring-status-connected' },
  disconnected: { icon: BluetoothOff, label: 'Disconnected', cssClass: 'ring-status-disconnected' },
  connecting: { icon: Loader2, label: 'Connecting...', cssClass: 'ring-status-syncing' },
  syncing: { icon: Loader2, label: 'Syncing...', cssClass: 'ring-status-syncing' },
  error: { icon: AlertCircle, label: 'Error', cssClass: 'ring-status-disconnected' },
};

export function ConnectionBadge({ status, className = '' }: ConnectionBadgeProps) {
  const { icon: Icon, label, cssClass } = config[status];
  const spinning = status === 'connecting' || status === 'syncing';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cssClass} ${className}`}>
      <Icon className={`h-3 w-3 ${spinning ? 'animate-spin-slow' : ''}`} />
      {label}
    </div>
  );
}
