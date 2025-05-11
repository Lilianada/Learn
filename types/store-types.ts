export type Subject = {
  id: string
  title: string
  description?: string
  createdAt?: string
  updatedAt?: string
  topicOrder: string[]
  order?: number
}

export type Topic = {
  id: string
  title: string
  description?: string
  createdAt?: string
  updatedAt?: string
  subtopicOrder?: string[]
  subjectId: string
  content?: string // Direct content for topics without subtopics
  order?: number
}

export type Subtopic = {
  id: string
  title: string
  description?: string
  createdAt?: string
  updatedAt?: string
  topicId: string
  content: string
  order?: number
  status?: 'not-started' | 'in-progress' | 'completed'
  completionPercentage?: number
  notes?: string
}
