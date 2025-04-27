/* server/utils/fs.ts ------------------------------------------------------- */
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function assetPath(...parts: string[]) {
  return resolve(__dirname, "..", "assets", ...parts);
}
