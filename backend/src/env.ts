/**
 * Environment Configuration
 * This file must be imported first to ensure environment variables are loaded
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const envPath = resolve(projectRoot, ".env");

config({ path: envPath });

if (process.env.DATABASE_PATH && process.env.DATABASE_PATH.startsWith("./")) {
  process.env.DATABASE_PATH = resolve(projectRoot, process.env.DATABASE_PATH);
}
