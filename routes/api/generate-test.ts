// routes/api/generate-test.ts
import { Handlers } from "$fresh/server.ts";
import { getDB } from "../../utils/database.ts";
import type { Question, TestVariant } from "../../utils/models.ts";

interface GenerateRequest {
  configId: number;
  numVariants: number;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const { configId, numVariants = 5 }: GenerateRequest = await req.json();
      const db = getDB();
      
      // Получаем конфигурацию
      const configRows = db.query<[number, string, string, string]>(
        "SELECT id, name, config_data, created_at FROM test_configs WHERE id = ?",
        [configId]
      );
      
      if (configRows.length === 0) {
        return new Response(JSON.stringify({ error: "Configuration not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const [, , configDataStr] = configRows[0];
      const configData: Record<string, number> = JSON.parse(configDataStr);
      
      // Удаляем старые варианты
      db.query("DELETE FROM test_variants WHERE test_config_id = ?", [configId]);
      
      const variants: TestVariant[] = [];
      
      for (let variantNum = 1; variantNum <= numVariants; variantNum++) {
        const allSelectedQuestions: Question[] = [];
        
        // Выбираем вопросы по каждой категории
        for (const [categoryKey, count] of Object.entries(configData)) {
          if (count > 0) {
            const parts = categoryKey.split("|");
            const specialty = parts[0] && parts[0] !== "*" ? parts[0] : undefined;
            const course = parts[1] && parts[1] !== "*" ? parts[1] : undefined;
            const discipline = parts[2] && parts[2] !== "*" ? parts[2] : undefined;
            const topic = parts[3] && parts[3] !== "*" ? parts[3] : undefined;
            
            let query = "SELECT * FROM questions WHERE 1=1";
            const params: any[] = [];
            
            if (specialty) {
              query += " AND specialty = ?";
              params.push(specialty);
            }
            if (course) {
              query += " AND course = ?";
              params.push(course);
            }
            if (discipline) {
              query += " AND discipline = ?";
              params.push(discipline);
            }
            if (topic) {
              query += " AND topic = ?";
              params.push(topic);
            }
            
            const questionRows = db.query(query, params);
            const questions: Question[] = questionRows.map(row => ({
              id: row[0],
              specialty: row[1],
              course: row[2],
              discipline: row[3],
              topic: row[4],
              question_text: row[5],
              question_type: row[6] as "single" | "multiple",
              options: JSON.parse(row[7]),
              correct_answers: JSON.parse(row[8]),
              points: row[9]
            }));
            
            // Выбираем случайные вопросы
            const shuffled = [...questions].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(count, shuffled.length));
            allSelectedQuestions.push(...selected);
          }
        }
        
        // Перемешиваем все вопросы
        const shuffledQuestions = [...allSelectedQuestions].sort(() => 0.5 - Math.random());
        
        // Сохраняем вариант
        const result = db.query(
          "INSERT INTO test_variants (test_config_id, variant_number, questions_data) VALUES (?, ?, ?)",
          [configId, variantNum, JSON.stringify(shuffledQuestions)]
        );
        
        variants.push({
          id: result.lastInsertRowId,
          test_config_id: configId,
          variant_number: variantNum,
          questions: shuffledQuestions,
          answers_data: {}
        });
      }
      
      return new Response(JSON.stringify({ success: true, variants }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in POST /api/generate-test:", error);
      return new Response(JSON.stringify({ error: "Failed to generate test variants" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};