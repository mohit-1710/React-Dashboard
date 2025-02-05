import React from 'react';
import ProjectCard from './ProjectCard';
import { Card } from './ui/card';
import { Trophy } from 'lucide-react';
import type { Project } from '@/types/project';

interface DifficultySectionProps {
  title: string;
  projects: Project[];
  isActive: boolean;
  progress: { [key: string]: { completed: boolean; completedAt: string | null } };
}

const DifficultySection: React.FC<DifficultySectionProps> = ({
  title,
  projects,
  isActive,
  progress,
}) => {
  if (!isActive && title.toLowerCase() !== 'beginner') {
    return (
      <section className="mb-12 animate-slide-up">
        <h2 className="text-2xl font-bold mb-4">{title} Projects</h2>
        <Card className="p-6 bg-yellow-500/10 backdrop-blur border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level Locked</p>
              <p className="text-xl font-bold text-foreground">
                Complete the previous level to unlock {title} projects
              </p>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12 animate-slide-up">
      <h2 className="text-2xl font-bold mb-4">{title} Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            completed={progress[project.id]?.completed || false}
            completedAt={progress[project.id]?.completedAt || null}
          />
        ))}
      </div>
    </section>
  );
};

export default DifficultySection;