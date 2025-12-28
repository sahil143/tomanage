import { createFileRoute } from '@tanstack/react-router';
import { useSettings } from '@/hooks/settings/useSettings';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AppInfoSection } from '@/components/settings/AppInfoSection';
import { ActionsSection } from '@/components/settings/ActionsSection';

export const Route = createFileRoute('/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const {
    appInfo,
    context,
    isLoadingContext,
    isConnected,
    onClearCache,
    isClearingCache,
  } = useSettings();

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your preferences and app information
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
        <AppInfoSection
          appName={appInfo.name}
          appVersion={appInfo.version}
          isConnected={isConnected}
        />

        <ProfileSection context={context} isLoading={isLoadingContext} />

        <ActionsSection
          onClearCache={onClearCache}
          isClearingCache={isClearingCache}
        />
      </div>
    </div>
  );
}
