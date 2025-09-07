#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import { setupDatabase } from "./utils/database.ts";

await setupDatabase();
await dev(import.meta.url, "./main.ts", config);
