// routes/api/test-configs.ts
import { Handlers } from "$fresh/server.ts";
import { getDB } from "../../utils/database.ts";
import type { TestConfig } from "../../utils/models.ts";

export const handler: Handlers = {
  async GET(_req) {
    try {
      const db = getDB();
      const configs = db.query<[number, string, string, string]>(
        "SELECT id, name, config_data, created_at FROM test_configs ORDER BY id DESC"
      ).map(([id, name, config_data, created_at]) => ({
        id,
        name,
        config_data: JSON.parse(config_data),
        created_at
      }));
      
      return new Response(JSON.stringify(configs), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in GET /api/test-configs:", error);
      return new Response(JSON.stringify({ error: "Failed to load test configs" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  async POST(req) {
    try {
      const config: Omit<TestConfig, "id" | "created_at"> = await req.json();
      const db = getDB();
      
      const result = db.query(
        "INSERT INTO test_configs (name, config_data) VALUES (?, ?)",
        [
          config.name,
          JSON.stringify(config.config_data)
        ]
      );
      
      return new Response(JSON.stringify({ id: result.lastInsertRowId }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in POST /api/test-configs:", error);
      return new Response(JSON.stringify({ error: "Failed to create test config" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  async DELETE(req) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      
      if (!id) {
        return new Response("Missing id parameter", { status: 400 });
      }
      
      const db = getDB();
      db.query("DELETE FROM test_configs WHERE id=?", [parseInt(id)]);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in DELETE /api/test-configs:", error);
      return new Response(JSON.stringify({ error: "Failed to delete test config" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};