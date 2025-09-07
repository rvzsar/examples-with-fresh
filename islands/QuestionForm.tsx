// islands/QuestionForm.tsx
import { useState } from "preact/hooks";
import type { Question } from "../utils/models.ts";

interface QuestionFormProps {
  initialQuestion?: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export default function QuestionForm(props: QuestionFormProps) {
  const [question, setQuestion] = useState<Question>(
    props.initialQuestion || {
      id: 0,
      specialty: "",
      course: "",
      discipline: "",
      topic: "",
      question_text: "",
      question_type: "single",
      options: [""],
      correct_answers: [],
      points: 1
    }
  );

  const addOption = () => {
    setQuestion({
      ...question,
      options: [...question.options, ""]
    });
  };

  const removeOption = (index: number) => {
    if (question.options.length <= 1) return;
    
    const newOptions = [...question.options];
    newOptions.splice(index, 1);
    
    const newCorrectAnswers = question.correct_answers
      .filter(ans => ans !== index)
      .map(ans => ans > index ? ans - 1 : ans);
    
    setQuestion({
      ...question,
      options: newOptions,
      correct_answers: newCorrectAnswers
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = question.correct_answers.includes(index)
      ? question.correct_answers.filter(ans => ans !== index)
      : [...question.correct_answers, index];
    
    setQuestion({ ...question, correct_answers: newCorrectAnswers.sort() });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSave(question);
  };

  return (
    <div class="card p-4 mb-4 bg-white rounded-lg shadow">
      <h3 class="text-xl font-bold mb-4">
        {props.initialQuestion ? "Редактировать вопрос" : "Добавить вопрос"}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Специальность"
            value={question.specialty}
            onInput={(e) => setQuestion({...question, specialty: (e.target as HTMLInputElement).value})}
            class="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Курс"
            value={question.course}
            onInput={(e) => setQuestion({...question, course: (e.target as HTMLInputElement).value})}
            class="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Дисциплина"
            value={question.discipline}
            onInput={(e) => setQuestion({...question, discipline: (e.target as HTMLInputElement).value})}
            class="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Тема"
            value={question.topic}
            onInput={(e) => setQuestion({...question, topic: (e.target as HTMLInputElement).value})}
            class="border rounded p-2"
            required
          />
        </div>

        <textarea
          placeholder="Текст вопроса"
          value={question.question_text}
          onInput={(e) => setQuestion({...question, question_text: (e.target as HTMLTextAreaElement).value})}
          class="w-full border rounded p-2 mb-4 h-24"
          required
        />

        <div class="mb-4">
          <label class="block mb-2 font-medium">Тип вопроса:</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input
                type="radio"
                name="question_type"
                checked={question.question_type === "single"}
                onChange={() => setQuestion({...question, question_type: "single"})}
                class="mr-2"
              />
              Один правильный ответ
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                name="question_type"
                checked={question.question_type === "multiple"}
                onChange={() => setQuestion({...question, question_type: "multiple"})}
                class="mr-2"
              />
              Несколько правильных ответов
            </label>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="font-bold mb-2">Варианты ответов:</h4>
          {question.options.map((option, index) => (
            <div class="flex items-center mb-2" key={index}>
              <input
                type="checkbox"
                checked={question.correct_answers.includes(index)}
                onChange={() => toggleCorrectAnswer(index)}
                class="mr-2"
              />
              <input
                type="text"
                value={option}
                onInput={(e) => updateOption(index, (e.target as HTMLInputElement).value)}
                class="flex-1 border rounded p-1 mr-2"
                placeholder={`Вариант ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                class="bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Удалить
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            class="bg-green-500 text-white px-3 py-1 rounded mt-2"
          >
            Добавить вариант
          </button>
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-medium">Баллы:</label>
          <input
            type="number"
            min="1"
            value={question.points}
            onInput={(e) => setQuestion({...question, points: parseInt((e.target as HTMLInputElement).value) || 1})}
            class="border rounded p-2 w-20"
          />
        </div>

        <div class="flex space-x-2">
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={props.onCancel}
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
