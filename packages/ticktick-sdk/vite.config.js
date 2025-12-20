import { libraryConfig } from "@tomanage/vite-config/library";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default libraryConfig({
  packageRoot: __dirname,
  entry: "src/index.ts",
  formats: ["es"],
  fileName: "index",
});


