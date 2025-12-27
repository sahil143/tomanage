import { Page } from "@/components/page"
import { Outlet, createRootRoute } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <Page>
      <Outlet />
    </Page>
  )
}
