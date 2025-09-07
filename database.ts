// utils/database.ts
import { DB } from "sqlite";

let db: DB | null = null;

export function getDB(): DB {
  if (!db) {
    db = new DB("test_system.db");
    initializeTables();
  }
  return db;
}

function initializeTables() {
  const db = getDB();
  
  // Таблица вопросов
  db.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      specialty TEXT,
      course TEXT,
      discipline TEXT,
      topic TEXT,
      question_text TEXT,
      question_type TEXT,
      options TEXT,
      correct_answers TEXT,
      points INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Таблица конфигураций тестов
  db.execute(`
    CREATE TABLE IF NOT EXISTS test_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      config_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Таблица вариантов тестов
  db.execute(`
    CREATE TABLE IF NOT EXISTS test_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_config_id INTEGER,
      variant_number INTEGER,
      questions_data TEXT,
      answers_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Добавляем тестовые данные
  const count = db.query("SELECT COUNT(*) FROM questions")[0][0] as number;
  if (count === 0) {
    // Добавляем примеры вопросов
    db.execute(`
      INSERT INTO questions (specialty, course, discipline, topic, question_text, question_type, options, correct_answers, points)
      VALUES 
      ('Информатика', '2', 'Программирование', 'JavaScript', 'Что такое замыкание в JavaScript?', 'single', '["Функция внутри функции","Объект, который замыкает переменные","Функция, которая сохраняет доступ к внешним переменным","Все вышеперечисленное"]', '[2]', 2),
      ('Информатика', '2', 'Программирование', 'Python', 'Какой метод используется для добавления элемента в список?', 'single', '["append()","add()","push()","insert()"]', '[0]', 1),
      ('Математика', '1', 'Алгебра', 'Уравнения', 'Решите уравнение: 2x + 5 = 15', 'single', '["x = 5","x = 10","x = 7.5","x = 2.5"]', '[0]', 2),
      ('Физика', '2', 'Механика', 'Динамика', 'Второй закон Ньютона выражается формулой:', 'multiple', '["F = ma","a = F/m","F = mv","m = F/a"]', '[0,1]', 3)
    `);
  }
}

export async function setupDatabase() {
  initializeTables();
  console.log("Database initialized");
}