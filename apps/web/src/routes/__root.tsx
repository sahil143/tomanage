import { Page } from "@/components/page"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Outlet, createRootRoute } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ErrorBoundary>
      <Page>
        <Outlet />
      </Page>
    </ErrorBoundary>
  )
}
