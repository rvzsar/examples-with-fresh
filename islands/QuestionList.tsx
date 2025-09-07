// islands/QuestionList.tsx
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { Question } from "../utils/models.ts";

interface QuestionsListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

export default function QuestionsList(props: QuestionsListProps) {
  const [filters, setFilters] = useState({
    specialty: "",
    course: "",
    discipline: "",
    topic: ""
  });

  const filteredQuestions = props.questions.filter(question => {
    return (
      (!filters.specialty || question.specialty.toLowerCase().includes(filters.specialty.toLowerCase())) &&
      (!filters.course || question.course.toLowerCase().includes(filters.course.toLowerCase())) &&
      (!filters.discipline || question.discipline.toLowerCase().includes(filters.discipline.toLowerCase())) &&
      (!filters.topic || question.topic.toLowerCase().includes(filters.topic.toLowerCase()))
    );
  });

  return (
    <div class="card p-4 bg-white rounded-lg shadow">
      <h3 class="text-xl font-bold mb-4">Список вопросов ({filteredQuestions.length})</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Специальность"
          value={filters.specialty}
          onInput={(e) => setFilters({...filters, specialty: (e.target as HTMLInputElement).value})}
          class="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Курс"
          value={filters.course}
          onInput={(e) => setFilters({...filters, course: (e.target as HTMLInputElement).value})}
          class="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Дисциплина"
          value={filters.discipline}
          onInput={(e) => setFilters({...filters, discipline: (e.target as HTMLInputElement).value})}
          class="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Тема"
          value={filters.topic}
          onInput={(e) => setFilters({...filters, topic: (e.target as HTMLInputElement).value})}
          class="border rounded p-2"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 text-left">#</th>
              <th class="py-2 px-4 text-left">Специальность</th>
              <th class="py-2 px-4 text-left">Курс</th>
              <th class="py-2 px-4 text-left">Дисциплина</th>
              <th class="py-2 px-4 text-left">Тема</th>
              <th class="py-2 px-4 text-left">Вопрос</th>
              <th class="py-2 px-4 text-left">Тип</th>
              <th class="py-2 px-4 text-left">Баллы</th>
              <th class="py-2 px-4 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question, index) => (
              <tr key={question.id} class="border-b hover:bg-gray-50">
                <td class="py-2 px-4">{index + 1}</td>
                <td class="py-2 px-4">{question.specialty}</td>
                <td class="py-2 px-4">{question.course}</td>
                <td class="py-2 px-4">{question.discipline}</td>
                <td class="py-2 px-4">{question.topic}</td>
                <td class="py-2 px-4">
                  <div class="max-w-xs truncate" title={question.question_text}>
                    {question.question_text}
                  </div>
                </td>
                <td class="py-2 px-4">
                  {question.question_type === "single" ? "Один" : "Несколько"}
                </td>
                <td class="py-2 px-4">{question.points}</td>
                <td class="py-2 px-4">
                  <div class="flex space-x-1">
                    <button
                      onClick={() => props.onEdit(question)}
                      class="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Ред.
                    </button>
                    <button
                      onClick={() => props.onDelete(question.id)}
                      class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredQuestions.length === 0 && (
          <div class="text-center py-8 text-gray-500">
            Вопросы не найдены. Попробуйте изменить фильтры или добавить новые вопросы.
          </div>
        )}
      </div>
    </div>
  );
}
