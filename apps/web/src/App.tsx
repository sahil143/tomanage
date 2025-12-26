import { ComponentExample } from "@/components/component-example";
import { TRPCProvider } from "@/utils/trpc";

export function App() {
  return (
    <TRPCProvider url="http://localhost:2022">
      <ComponentExample />
    </TRPCProvider>
  );
}

export default App;