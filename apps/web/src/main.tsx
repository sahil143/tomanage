import { TRPCProvider } from "@/utils/trpc";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TRPCProvider url="http://localhost:3001/trpc">
      <RouterProvider router={router} />
    </TRPCProvider>
  </StrictMode>
);
