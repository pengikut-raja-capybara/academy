export type Lesson = {
  id: string
  moduleId: string
  title: string
  description?: string
  video?: string // YouTube ID, optional
  content?: string // Markdown or HTML content, optional
  checklist: string[] // List of task strings
  duration?: number
  minWatchPercentage?: number // Default 90%
}

export type Module = {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export type ProgressMap = Record<string, {
  seen: Record<number, boolean>
  lastWatchedSec: number
  duration?: number
  completed: boolean
  checklist: Record<string, boolean> // taskIndex/id -> completed
}>

export type Theme = 'light' | 'dark'
