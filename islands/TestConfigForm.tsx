// islands/TestConfigForm.tsx
import { useState } from "preact/hooks";
import type { TestConfig } from "../utils/models.ts";

interface TestConfigFormProps {
  onSave: (config: Omit<TestConfig, "id" | "created_at">) => void;
  onCancel: () => void;
}

export default function TestConfigForm(props: TestConfigFormProps) {
  const [config, setConfig] = useState<Omit<TestConfig, "id" | "created_at">>({
    name: "",
    config_data: {}
  });

  const [newCategory, setNewCategory] = useState({
    key: "||||", // specialty|course|discipline|topic
    count: 1
  });

  const addCategory = () => {
    if (newCategory.key && newCategory.count > 0) {
      setConfig({
        ...config,
        config_data: {
          ...config.config_data,
          [newCategory.key]: newCategory.count
        }
      });
      setNewCategory({
        key: "||||",
        count: 1
      });
    }
  };

  const removeCategory = (key: string) => {
    const newData = { ...config.config_data };
    delete newData[key];
    setConfig({
      ...config,
      config_data: newData
    });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (config.name && Object.keys(config.config_data).length > 0) {
      props.onSave(config);
    }
  };

  return (
    <div class="card p-4 mb-4 bg-white rounded-lg shadow">
      <h3 class="text-xl font-bold mb-4">Создать конфигурацию теста</h3>
      
      <form onSubmit={handleSubmit}>
        <div class="mb-4">
          <label class="block mb-2 font-medium">Название конфигурации:</label>
          <input
            type="text"
            placeholder="Например: Промежуточный тест по программированию"
            value={config.name}
            onInput={(e) => setConfig({...config, name: (e.target as HTMLInputElement).value})}
            class="w-full border rounded p-2"
            required
          />
        </div>

        <div class="mb-4">
          <h4 class="font-bold mb-2">Настройка количества вопросов:</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
            <input
              type="text"
              placeholder="Специальность"
              value={newCategory.key.split("|")[0]}
              onInput={(e) => {
                const parts = newCategory.key.split("|");
                parts[0] = (e.target as HTMLInputElement).value;
                setNewCategory({...newCategory, key: parts.join("|")});
              }}
              class="border rounded p-1 text-sm"
            />
            <input
              type="text"
              placeholder="Курс"
              value={newCategory.key.split("|")[1]}
              onInput={(e) => {
                const parts = newCategory.key.split("|");
                parts[1] = (e.target as HTMLInputElement).value;
                setNewCategory({...newCategory, key: parts.join("|")});
              }}
              class="border rounded p-1 text-sm"
            />
            <input
              type="text"
              placeholder="Дисциплина"
              value={newCategory.key.split("|")[2]}
              onInput={(e) => {
                const parts = newCategory.key.split("|");
                parts[2] = (e.target as HTMLInputElement).value;
                setNewCategory({...newCategory, key: parts.join("|")});
              }}
              class="border rounded p-1 text-sm"
            />
            <input
              type="text"
              placeholder="Тема"
              value={newCategory.key.split("|")[3]}
              onInput={(e) => {
                const parts = newCategory.key.split("|");
                parts[3] = (e.target as HTMLInputElement).value;
                setNewCategory({...newCategory, key: parts.join("|")});
              }}
              class="border rounded p-1 text-sm"
            />
            <div class="flex">
              <input
                type="number"
                min="1"
                value={newCategory.count}
                onInput={(e) => setNewCategory({...newCategory, count: parseInt((e.target as HTMLInputElement).value) || 1})}
                class="border rounded p-1 text-sm flex-1"
              />
              <button
                type="button"
                onClick={addCategory}
                class="bg-green-500 text-white px-2 py-1 rounded ml-1 text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div class="mt-4">
            <h5 class="font-medium mb-2">Добавленные категории:</h5>
            {Object.entries(config.config_data).map(([key, count]) => {
              const [spec, course, disc, topic] = key.split("|");
              return (
                <div class="flex items-center justify-between bg-gray-50 p-2 rounded mb-1" key={key}>
                  <div class="text-sm">
                    <span class="font-medium">{count}</span> вопросов: 
                    {spec && <span> {spec}</span>}
                    {course && <span> → {course}</span>}
                    {disc && <span> → {disc}</span>}
                    {topic && <span> → {topic}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCategory(key)}
                    class="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {Object.keys(config.config_data).length === 0 && (
              <div class="text-gray-500 text-sm italic">
                Нет добавленных категорий
              </div>
            )}
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            type="submit"
            disabled={!config.name || Object.keys(config.config_data).length === 0}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Создать конфигурацию
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