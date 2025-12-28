/**
 * ActionsSection Component
 * Settings actions (clear cache, etc.)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

interface ActionsSectionProps {
  onClearCache: () => void;
  isClearingCache: boolean;
}

export function ActionsSection({ onClearCache, isClearingCache }: ActionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Manage your data and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clear Cache</p>
              <p className="text-xs text-muted-foreground">
                Remove all stored patterns and analytics data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCache}
              disabled={isClearingCache}
            >
              {isClearingCache ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
