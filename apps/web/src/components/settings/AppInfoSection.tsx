/**
 * AppInfoSection Component
 * Displays app information and server status
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AppInfoSectionProps {
  appName: string;
  appVersion: string;
  isConnected: boolean;
}

export function AppInfoSection({ appName, appVersion, isConnected }: AppInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Information</CardTitle>
        <CardDescription>Application details and server status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">App Name</p>
            <p className="text-sm mt-1">{appName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Version</p>
            <p className="text-sm mt-1">v{appVersion}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Server Status</p>
            <div className="flex items-center gap-2 mt-1">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    Disconnected
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
