// routes/api/questions.ts
import { Handlers } from "$fresh/server.ts";
import { getDB } from "../../utils/database.ts";
import type { Question } from "../../utils/models.ts";

export const handler: Handlers = {
  async GET(_req) {
    try {
      const db = getDB();
      const questions = db.query<[number, string, string, string, string, string, string, string, string, number, string]>(
        "SELECT * FROM questions ORDER BY id DESC"
      ).map(([id, specialty, course, discipline, topic, question_text, question_type, options, correct_answers, points, created_at]) => ({
        id,
        specialty,
        course,
        discipline,
        topic,
        question_text,
        question_type: question_type as "single" | "multiple",
        options: JSON.parse(options),
        correct_answers: JSON.parse(correct_answers),
        points,
        created_at
      }));
      
      return new Response(JSON.stringify(questions), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in GET /api/questions:", error);
      return new Response(JSON.stringify({ error: "Failed to load questions" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  async POST(req) {
    try {
      const question: Omit<Question, "id" | "created_at"> = await req.json();
      const db = getDB();
      
      const result = db.query(
        "INSERT INTO questions (specialty, course, discipline, topic, question_text, question_type, options, correct_answers, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          question.specialty,
          question.course,
          question.discipline,
          question.topic,
          question.question_text,
          question.question_type,
          JSON.stringify(question.options),
          JSON.stringify(question.correct_answers),
          question.points
        ]
      );
      
      return new Response(JSON.stringify({ id: result.lastInsertRowId }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in POST /api/questions:", error);
      return new Response(JSON.stringify({ error: "Failed to create question" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  async PUT(req) {
    try {
      const question: Question = await req.json();
      const db = getDB();
      
      db.query(
        "UPDATE questions SET specialty=?, course=?, discipline=?, topic=?, question_text=?, question_type=?, options=?, correct_answers=?, points=? WHERE id=?",
        [
          question.specialty,
          question.course,
          question.discipline,
          question.topic,
          question.question_text,
          question.question_type,
          JSON.stringify(question.options),
          JSON.stringify(question.correct_answers),
          question.points,
          question.id
        ]
      );
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in PUT /api/questions:", error);
      return new Response(JSON.stringify({ error: "Failed to update question" }), {
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
      db.query("DELETE FROM questions WHERE id=?", [parseInt(id)]);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in DELETE /api/questions:", error);
      return new Response(JSON.stringify({ error: "Failed to delete question" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
