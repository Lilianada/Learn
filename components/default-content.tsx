import { nanoid } from "nanoid";
import { Subject, Topic, Subtopic } from "../types/store-types";

export const defaultContent = {
  subjects: {
    welcome: {
      id: "welcome",
      title: "Welcome",
      order: 0,
      topicOrder: ["getting_started"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Subject,
  },
  topics: {
    getting_started: {
      id: "getting_started",
      title: "Getting Started",
      subjectId: "welcome",
      order: 0,
      subtopicOrder: ["welcome_guide"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Topic,
  },
  subtopics: {
    welcome_guide: {
      id: "welcome_guide",
      title: "Welcome to LearnDev",
      topicId: "getting_started",
      content: `<h1>Welcome to LearnDev!</h1>
      <p>Your personal learning space for organizing and mastering development concepts.</p>
      
      <h2>Quick Guide</h2>
      <ul>
        <li><strong>Organize</strong>: Create subjects, topics, and subtopics using the sidebar</li>
        <li><strong>Write</strong>: Use the rich text editor to write your notes with formatting</li>
        <li><strong>Navigate</strong>: Click items in the sidebar to move between your content</li>
        <li><strong>Customize</strong>: Change themes and fonts in the settings menu</li>
        <li><strong>Backup</strong>: Export your data regularly from the settings menu</li>
      </ul>
      
      <h2>Structure</h2>
      <ul>
        <li><strong>Subjects</strong>: Main categories (e.g., "JavaScript", "React")</li>
        <li><strong>Topics</strong>: Major areas within a subject</li>
        <li><strong>Subtopics</strong>: Specific lessons or concepts</li>
      </ul>
      
      <p>Ready to start learning? Create your first subject using the "+" button in the sidebar!</p>
      
      <div style="padding: 12px; margin: 16px 0; background-color: rgba(59, 130, 246, 0.1); border-radius: 6px;">

\
      <div style="padding: 12px; margin: 16px 0; background-color: rgba(244, 63, 94, 0.1); border-radius: 6px;">
      <h2>Report Issues</h2>
      <p>If you encounter any issues or bugs, please report them on our GitHub repository.</p>
      <p>To report an issue, follow these steps:</p>
      <ol>
        <li>Go to the "Issues" tab of the repository</li>
        <li>Click on "New Issue"</li>
        <li>Provide a clear title and description of the issue</li>
        <li>Include steps to reproduce the issue, if applicable</li>
        <li>Submit the issue</li>
      </ol>
      <p>Your feedback helps us improve the application!</p>
      </div>

      <div style="padding: 12px; margin: 16px 0; background-color: rgba(34, 197, 94, 0.1); border-radius: 6px;">
      <h2>Data Storage</h2>
      <p>Your data is stored locally in your browser's local storage. This means that your content is saved even if you close the app or refresh the page.</p>
      <p>To ensure your data is safe, we recommend exporting your content regularly. You can do this from the settings menu.</p>
      <p>To export your data, follow these steps:</p>
      <ol>
        <li>Click on the settings icon in the top right corner</li> 
        <li>Select "Export Data"</li>
        <li>Choose the format you want to export (e.g., JSON, Markdown)</li>
        <li>Save the file to your computer</li>
      </ol>
      </div>

        <p><strong>Note:</strong> This app was made for personal use not to be redistributed.</p>
      </div>`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Subtopic,
  },
};
