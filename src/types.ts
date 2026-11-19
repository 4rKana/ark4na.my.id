export type TaskStatus = 'Belum Selesai' | 'Selesai';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskFilter = 'ALL' | TaskStatus;

export interface CourseTask {
  id: number;
  title: string;
  course: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  isCompleted: boolean;
}

export interface AppConfig {
  appName: string;
  appVersion: string;
  appEnv: string;
}