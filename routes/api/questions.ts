// routes/api/questions.ts
import { Handlers } from "$fresh/server.ts";
import { getDB } from "../../utils/database.ts";
import type { Question } from "../../utils/models.ts";

// Validation function for Question objects
function validateQuestion(question: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!question.specialty || typeof question.specialty !== 'string' || question.specialty.trim() === '') {
    errors.push('Специальность обязательна');
  }
  
  if (!question.course || typeof question.course !== 'string' || question.course.trim() === '') {
    errors.push('Курс обязателен');
  }
  
  if (!question.discipline || typeof question.discipline !== 'string' || question.discipline.trim() === '') {
    errors.push('Дисциплина обязательна');
  }
  
  if (!question.topic || typeof question.topic !== 'string' || question.topic.trim() === '') {
    errors.push('Тема обязательна');
  }
  
  if (!question.question_text || typeof question.question_text !== 'string' || question.question_text.trim() === '') {
    errors.push('Текст вопроса обязателен');
  }
  
  if (question.question_type !== 'single' && question.question_type !== 'multiple') {
    errors.push('Тип вопроса должен быть "single" или "multiple"');
  }
  
  if (!Array.isArray(question.options) || question.options.length < 2) {
    errors.push('Должно быть минимум 2 варианта ответа');
  } else {
    // Check that all options are non-empty strings
    for (let i = 0; i < question.options.length; i++) {
      if (typeof question.options[i] !== 'string' || question.options[i].trim() === '') {
        errors.push(`Вариант ответа ${i + 1} не может быть пустым`);
      }
    }
  }
  
  if (!Array.isArray(question.correct_answers)) {
    errors.push('Правильные ответы должны быть массивом');
  } else {
    // Check that correct_answers contains valid indices
    for (const index of question.correct_answers) {
      if (typeof index !== 'number' || index < 0 || index >= question.options.length) {
        errors.push(`Неверный индекс правильного ответа: ${index}`);
      }
    }
    
    // For single choice questions, there should be exactly one correct answer
    if (question.question_type === 'single' && question.correct_answers.length !== 1) {
      errors.push('Для вопроса с одним вариантом ответа должен быть ровно один правильный ответ');
    }
    
    // For multiple choice questions, there should be at least one correct answer
    if (question.question_type === 'multiple' && question.correct_answers.length < 1) {
      errors.push('Для вопроса с несколькими вариантами ответов должен быть хотя бы один правильный ответ');
    }
  }
  
  if (typeof question.points !== 'number' || question.points < 1) {
    errors.push('Баллы должны быть положительным числом');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

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
      const question = await req.json();
      
      const validation = validateQuestion(question);
      if (!validation.isValid) {
        return new Response(JSON.stringify({ errors: validation.errors }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
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
      const question = await req.json();
      
      if (!question.id) {
        return new Response(JSON.stringify({ error: "Missing id for update" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const validation = validateQuestion(question);
      if (!validation.isValid) {
        return new Response(JSON.stringify({ errors: validation.errors }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
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