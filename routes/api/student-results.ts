
// routes/api/student-results.ts
import { Handlers } from "$fresh/server.ts";
import { getDB } from "../../utils/database.ts";
import type { StudentResult, Question } from "../../utils/models.ts";

// Helper function to calculate the grade based on percentage
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "Отлично";
  if (percentage >= 75) return "Хорошо";
  if (percentage >= 50) return "Удовлетворительно";
  return "Неудовлетворительно";
}

export const handler: Handlers = {
  // Get all student results
  async GET(_req) {
    try {
      const db = getDB();
      const results = db.query<[number, number, string, number, number, number, string, string]>(
        "SELECT * FROM student_results ORDER BY created_at DESC"
      ).map(([id, variant_id, student_name, earned_points, total_points, percentage, grade, created_at]) => ({
        id,
        variant_id,
        student_name,
        earned_points,
        total_points,
        percentage,
        grade,
        created_at
      }));
      
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in GET /api/student-results:", error);
      return new Response(JSON.stringify({ error: "Failed to load student results" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  // Submit a student's test answers and create a result
  async POST(req) {
    try {
      const { variant_id, student_name, answers } = await req.json();
      
      if (!variant_id || !student_name || !answers) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const db = getDB();

      // Get the test variant to access the questions
      const variantRows = db.query<[string]>(
        "SELECT questions_data FROM test_variants WHERE id = ?",
        [variant_id]
      );

      if (variantRows.length === 0) {
        return new Response(JSON.stringify({ error: "Test variant not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      const questions: Question[] = JSON.parse(variantRows[0][0]);
      let earned_points = 0;
      let total_points = 0;

      // Calculate score
      for (const question of questions) {
        total_points += question.points;
        const studentAnswers = answers[question.id] || [];
        const correctAnswers = question.correct_answers;

        if (question.question_type === 'single') {
          if (studentAnswers.length === 1 && studentAnswers[0] === correctAnswers[0]) {
            earned_points += question.points;
          }
        } else { // multiple
          const isCorrect = correctAnswers.length === studentAnswers.length &&
                            correctAnswers.every(ans => studentAnswers.includes(ans));
          if (isCorrect) {
            earned_points += question.points;
          }
        }
      }

      const percentage = total_points > 0 ? (earned_points / total_points) * 100 : 0;
      const grade = calculateGrade(percentage);

      const result = db.query(
        "INSERT INTO student_results (variant_id, student_name, earned_points, total_points, percentage, grade) VALUES (?, ?, ?, ?, ?, ?)",
        [variant_id, student_name, earned_points, total_points, percentage, grade]
      );

      return new Response(JSON.stringify({ id: result.lastInsertRowId }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in POST /api/student-results:", error);
      return new Response(JSON.stringify({ error: "Failed to create student result" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};