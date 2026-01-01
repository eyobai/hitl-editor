import { Badge } from '@/components/ui/badge';
import { JobStatus } from '@/lib/types';

const statusConfig: Record<
  JobStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'pending' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  pending_review: { label: 'Pending Review', variant: 'pending' },
  in_review: { label: 'In Review', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
};

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
