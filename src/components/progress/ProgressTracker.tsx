import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProjectProgress {
  completed: boolean;
  completedAt: string;
}

interface LevelProgress {
  [projectId: string]: ProjectProgress;
}

interface UserProgress {
  beginner: LevelProgress;
  intermediate: LevelProgress;
  advanced: LevelProgress;
}

export const ProgressTracker = () => {
  const { getUserProgress } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      const userProgress = await getUserProgress();
      setProgress(userProgress);
    };
    fetchProgress();
  }, [getUserProgress, refreshKey]);

  const calculateProgress = (level: keyof UserProgress) => {
    if (!progress) return 0;
    const levelProjects = progress[level];
    const completedProjects = Object.values(levelProjects).filter(
      (project) => project.completed
    ).length;
    return (completedProjects / 5) * 100;
  };

  const getCompletedCount = (level: keyof UserProgress) => {
    if (!progress) return 0;
    const levelProjects = progress[level];
    return Object.values(levelProjects).filter((project) => project.completed).length;
  };

  const getNextLevelText = (level: keyof UserProgress) => {
    const completed = getCompletedCount(level);
    const remaining = 5 - completed;
    
    switch(level) {
      case 'beginner':
        return `${remaining} more to Intermediate`;
      case 'intermediate':
        return `${remaining} more to Advanced`;
      case 'advanced':
        return `${remaining} more to Expert`;
      default:
        return 'Level Complete!';
    }
  };

  if (!progress) return null;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Beginner Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Beginner</h3>
              <span className="text-sm text-muted-foreground">
                {getCompletedCount('beginner')}/5 completed
              </span>
            </div>
            <Progress value={calculateProgress('beginner')} className="h-2" />
            <p className="text-sm text-muted-foreground">{getNextLevelText('beginner')}</p>
          </div>

          {/* Intermediate Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Intermediate</h3>
              <span className="text-sm text-muted-foreground">
                {getCompletedCount('intermediate')}/5 completed
              </span>
            </div>
            <Progress value={calculateProgress('intermediate')} className="h-2" />
            <p className="text-sm text-muted-foreground">{getNextLevelText('intermediate')}</p>
          </div>

          {/* Advanced Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Advanced</h3>
              <span className="text-sm text-muted-foreground">
                {getCompletedCount('advanced')}/5 completed
              </span>
            </div>
            <Progress value={calculateProgress('advanced')} className="h-2" />
            <p className="text-sm text-muted-foreground">{getNextLevelText('advanced')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
