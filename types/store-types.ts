export type Subject = {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  topicOrder: string[]
}

export type Topic = {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  subtopicOrder: string[]
  subjectId: string
  content?: string // Direct content for topics without subtopics
}

export type Subtopic = {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  topicId: string
  content: string
}
