/**
 * ProfileSection Component
 * Displays user profile information
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileSectionProps {
  context?: any; // Backend context has different shape
  isLoading: boolean;
}

export function ProfileSection({ context, isLoading }: ProfileSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Context</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!context) return null;

  // Extract context data
  const ctx = context.context || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Context</CardTitle>
        <CardDescription>Current time and activity context</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Day</p>
            <p className="text-sm mt-1">{ctx.dayOfWeek || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Work Hours</p>
            <div className="flex items-center gap-2 mt-1">
              {ctx.isWorkHours ? (
                <Badge variant="default">Yes</Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Current Time</p>
            <p className="text-sm mt-1">{ctx.currentTime || 'N/A'}</p>
          </div>

          {ctx.predictedEnergy && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Predicted Energy</p>
              <Badge variant="secondary">{ctx.predictedEnergy}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
