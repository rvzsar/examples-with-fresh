// islands/StudentResultsList.tsx
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import type { StudentResult } from "../utils/models.ts";

export default function StudentResultsList() {
  const [results, setResults] = useState<StudentResult[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await fetch("/api/student-results");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error loading student results:", error);
    }
  };

  return (
    <div class="card p-4 bg-white rounded-lg shadow">
      <h3 class="text-xl font-bold mb-4">Результаты студентов ({results.length})</h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 text-left">#</th>
              <th class="py-2 px-4 text-left">Имя студента</th>
              <th class="py-2 px-4 text-left">ID Варианта</th>
              <th class="py-2 px-4 text-left">Полученные баллы</th>
              <th class="py-2 px-4 text-left">Всего баллов</th>
              <th class="py-2 px-4 text-left">Процент</th>
              <th class="py-2 px-4 text-left">Оценка</th>
              <th class="py-2 px-4 text-left">Дата</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id} class="border-b hover:bg-gray-50">
                <td class="py-2 px-4">{index + 1}</td>
                <td class="py-2 px-4">{result.student_name}</td>
                <td class="py-2 px-4">{result.variant_id}</td>
                <td class="py-2 px-4">{result.earned_points}</td>
                <td class="py-2 px-4">{result.total_points}</td>
                <td class="py-2 px-4">{result.percentage.toFixed(2)}%</td>
                <td class="py-2 px-4">{result.grade}</td>
                <td class="py-2 px-4">{new Date(result.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {results.length === 0 && (
          <div class="text-center py-8 text-gray-500">
            Результаты студентов отсутствуют.
          </div>
        )}
      </div>
    </div>
  );
}