export type Attachment = {
  title: string;
  file?: string;
  url?: string;
  type?: "pdf" | "zip" | "image" | "code" | "link" | string;
};

export type Lesson = {
  id: string;
  title: string;
  type?: "video" | "text" | "exercise";
  description?: string;
  content?: string; // Markdown or HTML content, optional
  video?: string; // YouTube ID, optional
  minWatchPercentage?: number; // Default 90%
  minScorePercentage?: number; // Default 80%
  exercise?: {
    type: "quiz" | "code";
    questions?: {
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  };
  checklist?: string[]; // List of task strings
  attachments?: Attachment[]; // Downloadable media/files
  duration?: number;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  submissionUrl?: string;
  submissionDescription?: string;
  submissionAttachments?: Attachment[];
  lessons?: Lesson[];
};

export type ProgressMap = Record<string, {
  seen: Record<number, boolean>
  lastWatchedSec: number
  duration?: number
  completed: boolean
  checklist: Record<string, boolean> // taskIndex/id -> completed
  quizAnswers?: Record<number, number> // questionIndex -> selectedOptionIndex
  quizScore?: number
}>

export type Theme = 'light' | 'dark'
