// routes/index.tsx
import { h } from "preact";
import { Head } from "$fresh/runtime.ts";
import { useState, useEffect } from "preact/hooks";
import QuestionForm from "../islands/QuestionForm.tsx";
import QuestionsList from "../islands/QuestionsList.tsx";
import TestConfigForm from "../islands/TestConfigForm.tsx";
import StudentResultsList from "../islands/StudentResultsList.tsx";
import type { Question, TestConfig } from "../utils/models.ts";

export default function Home() {
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [testConfigs, setTestConfigs] = useState<TestConfig[]>([]);
  const [showConfigForm, setShowConfigForm] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadTestConfigs();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const loadTestConfigs = async () => {
    try {
      const response = await fetch("/api/test-configs");
      const data = await response.json();
      setTestConfigs(data);
    } catch (error) {
      console.error("Error loading test configs:", error);
    }
  };

  const handleSaveQuestion = async (question: Question) => {
    try {
      const method = question.id ? "PUT" : "POST";
      const url = question.id ? "/api/questions" : "/api/questions";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question)
      });
      
      setEditingQuestion(null);
      loadQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот вопрос?")) {
      try {
        await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
        loadQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleSaveConfig = async (config: Omit<TestConfig, "id" | "created_at">) => {
    try {
      await fetch("/api/test-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      
      setShowConfigForm(false);
      loadTestConfigs();
    } catch (error) {
      console.error("Error saving test config:", error);
    }
  };

  const handleDeleteConfig = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту конфигурацию?")) {
      try {
        await fetch(`/api/test-configs?id=${id}`, { method: "DELETE" });
        loadTestConfigs();
      } catch (error) {
        console.error("Error deleting test config:", error);
      }
    }
  };

  const handleGenerateTest = async (configId: number) => {
    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId, numVariants: 5 })
      });
      
      const result = await response.json();
      if (result.success) {
        alert("Тест успешно сгенерирован!");
        setActiveTab("generation");
      } else {
        alert("Ошибка генерации теста: " + result.error);
      }
    } catch (error) {
      console.error("Error generating test:", error);
      alert("Ошибка генерации теста");
    }
  };

  return (
    <>
      <Head>
        <title>Система тестирования</title>
        <meta name="description" content="Система тестирования на Deno Fresh" />
        <style>{`
          body { margin: 0; font-family: system-ui, sans-serif; }
          .card { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        `}</style>
      </Head>
      
      <div class="min-h-screen bg-gray-100">
        <header class="bg-white shadow">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-900">Система тестирования</h1>
          </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="mb-6">
                <div class="border-b border-gray-200">
                  <nav class="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("questions")}
                      class={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "questions"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Вопросы ({questions.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("configs")}
                      class={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "configs"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Конфигурации тестов ({testConfigs.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("generation")}
                      class={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "generation"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Генерация тестов
                    </button>
                    <button
                      onClick={() => setActiveTab("results")}
                      class={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "results"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Результаты
                    </button>
                  </nav>
                </div>
              </div>

              {activeTab === "questions" && (
                <div>
                  {!editingQuestion ? (
                    <QuestionForm
                      onSave={handleSaveQuestion}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <QuestionForm
                      initialQuestion={editingQuestion}
                      onSave={handleSaveQuestion}
                      onCancel={handleCancelEdit}
                    />
                  )}
                  
                  <QuestionsList
                    questions={questions}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                </div>
              )}

              {activeTab === "configs" && (
                <div>
                  {!showConfigForm ? (
                    <div class="mb-6">
                      <button
                        onClick={() => setShowConfigForm(true)}
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Создать конфигурацию
                      </button>
                    </div>
                  ) : (
                    <TestConfigForm
                      onSave={handleSaveConfig}
                      onCancel={() => setShowConfigForm(false)}
                    />
                  )}
                  
                  <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Название
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Категории
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        {testConfigs.map((config) => (
                          <tr key={config.id}>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm font-medium text-gray-900">{config.name}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-500">
                                {Object.keys(config.config_data).length} категорий
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleGenerateTest(config.id)}
                                class="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Генерировать
                              </button>
                              <button
                                onClick={() => handleDeleteConfig(config.id)}
                                class="text-red-600 hover:text-red-900"
                              >
                                Удалить
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {testConfigs.length === 0 && (
                      <div class="text-center py-8 text-gray-500">
                        Нет конфигураций тестов. Создайте первую конфигурацию.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "generation" && (
                <div class="bg-white p-6 rounded-lg shadow">
                  <h2 class="text-2xl font-bold mb-4">Генерация тестов</h2>
                  <p class="text-gray-600 mb-4">
                    Здесь будет функционал для генерации вариантов тестов и создания PDF бланков.
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testConfigs.map((config) => (
                      <div key={config.id} class="border rounded-lg p-4">
                        <h3 class="font-bold text-lg mb-2">{config.name}</h3>
                        <p class="text-sm text-gray-600 mb-3">
                          {Object.keys(config.config_data).length} категорий
                        </p>
                        <button
                          onClick={() => handleGenerateTest(config.id)}
                          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                        >
                          Генерировать тесты
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {testConfigs.length === 0 && (
                    <div class="text-center py-8 text-gray-500">
                      Нет конфигураций для генерации. Создайте конфигурацию в разделе "Конфигурации тестов".
                    </div>
                  )}
                </div>
              )}

              {activeTab === "results" && (
                <StudentResultsList />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}