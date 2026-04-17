/**
 * Test setup file
 * Initializes the database before running tests
 */

import { beforeAll, afterAll } from "vitest";
import {
  initDatabase,
  closeDatabase,
  initSessionTables,
} from "../src/db/index.js";

beforeAll(async () => {
  await initDatabase();
  initSessionTables();
});

afterAll(() => {
  closeDatabase();
});
