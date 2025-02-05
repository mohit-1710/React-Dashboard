import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
  intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  difficulty,
  duration,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { getUserProgress } = useAuth();

  const checkCompletion = async () => {
    try {
      const userProgress = await getUserProgress();
      // Check if the project exists in the correct difficulty level and is marked as completed
      const isComplete = userProgress?.[difficulty]?.[id]?.completed ?? false;
      setIsCompleted(isComplete);
    } catch (error) {
      console.error('Error checking project completion:', error);
      setIsCompleted(false);
    }
  };

  useEffect(() => {
    checkCompletion();
    // Set up an interval to check for updates
    const intervalId = setInterval(checkCompletion, 2000);
    return () => clearInterval(intervalId);
  }, [id, difficulty]);

  return (
    <Link to={`/projects/${id}`} className="block">
      <Card className={`p-6 h-full hover:scale-[1.02] transition-transform ${
        isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900' : ''
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge className={difficultyColors[difficulty]}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 border-none">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{duration}</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
      </Card>
    </Link>
  );
};

export default ProjectCard;