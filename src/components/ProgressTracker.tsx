import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { BarChart, Trophy, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressTrackerProps {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  onProgressUpdate?: () => void;
}

interface ProjectProgress {
  completed: boolean;
  completedAt: string | null;
}

interface LevelProgress {
  [projectId: string]: ProjectProgress;
}

interface UserProgress {
  [level: string]: LevelProgress;
}

const levelRequirements = {
  'Beginner': { next: 'Intermediate', required: 3 },
  'Intermediate': { next: 'Advanced', required: 3 },
  'Advanced': { next: 'Expert', required: 3 },
  'Expert': { next: null, required: null },
} as const;

const ProgressTracker = ({ level, onProgressUpdate }: ProgressTrackerProps) => {
  const { getUserProgress } = useAuth();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [previousLevelComplete, setPreviousLevelComplete] = useState(false);
  const total = levelRequirements[level].required || 3;

  const checkPreviousLevel = async (userProgress: UserProgress) => {
    if (level === 'Beginner') return true;
    
    const previousLevel = level === 'Advanced' ? 'Intermediate' : 'Beginner';
    const previousCompleted = Object.values(userProgress?.[previousLevel.toLowerCase()] || {}).filter(
      project => project?.completed === true
    ).length;
    
    return previousCompleted >= 3;
  };

  const fetchProgress = async () => {
    try {
      const userProgress = await getUserProgress() as UserProgress;
      const isPreviousComplete = await checkPreviousLevel(userProgress);
      setPreviousLevelComplete(isPreviousComplete);
      
      const currentLevelProgress = userProgress?.[level.toLowerCase()];
      if (currentLevelProgress) {
        const completedProjects = Object.values(currentLevelProgress).filter(
          project => project?.completed === true
        );
        const completedCount = completedProjects.length;
        setCompleted(completedCount);
        setProgress((completedCount / total) * 100);
      } else {
        setCompleted(0);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setCompleted(0);
      setProgress(0);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [level, onProgressUpdate]);

  const nextLevel = levelRequirements[level];
  const remainingForNextLevel = nextLevel?.required ? nextLevel.required - completed : 0;

  if (!previousLevelComplete && level !== 'Beginner') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-3 bg-yellow-500/10 backdrop-blur border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level Locked</p>
              <p className="text-xl font-bold text-foreground">
                Complete the previous level to unlock {level} projects
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Progress Card */}
      <Card className="p-6 bg-card/10 backdrop-blur border-border/50">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <BarChart className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold text-foreground">{Math.round(progress)}%</p>
          </div>
        </div>
      </Card>

      {/* Completed Card */}
      <Card className="p-6 bg-card/10 backdrop-blur border-border/50">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <BookOpen className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-foreground">{completed} / {total}</p>
          </div>
        </div>
      </Card>

      {/* Next Level Card */}
      <Card className="p-6 bg-card/10 backdrop-blur border-border/50">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Level</p>
            <p className="text-2xl font-bold text-foreground">
              {remainingForNextLevel > 0
                ? `${remainingForNextLevel} more to ${nextLevel.next}`
                : "Level Complete!"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressTracker;