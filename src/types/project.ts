export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ProjectStep {
  title: string;
  description: string;
  codeTemplate: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'link' | 'image' | 'github' | 'other';
  url: string;
}

export interface TechStack {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: TechStack[];
  steps: ProjectStep[];
  resources: Resource[];
  createdAt?: string;
  updatedAt?: string;
}
