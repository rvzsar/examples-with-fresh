// utils/models.ts
export interface Question {
    id: number;
    specialty: string;
    course: string;
    discipline: string;
    topic: string;
    question_text: string;
    question_type: "single" | "multiple";
    options: string[];
    correct_answers: number[];
    points: number;
    created_at?: string;
  }
  
  export interface TestConfig {
    id: number;
    name: string;
    config_data: Record<string, number>; // key: "specialty|course|discipline|topic", value: count
    created_at?: string;
  }
  
  export interface TestVariant {
    id: number;
    test_config_id: number;
    variant_number: number;
    questions: Question[];
    answers_data: Record<string, number[]>;
    created_at?: string;
  }
  
  export interface StudentResult {
    variant_id: number;
    student_name: string;
    earned_points: number;
    total_points: number;
    percentage: number;
    grade: string;
  }