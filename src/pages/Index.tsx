import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DifficultySection from '@/components/DifficultySection';
import { ThemeToggle } from '@/components/ThemeToggle';
import ProgressTracker from '@/components/ProgressTracker';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { getProjects } from '@/lib/firebase/projects';
import { Settings } from 'lucide-react';
import type { Project } from '@/types/project';

const Index = () => {
  const navigate = useNavigate();
  const { getUserProgress } = useAuth();
  const { isAdmin } = useAdmin();
  const [refreshKey, setRefreshKey] = useState(0);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [activeLevel, setActiveLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  // Organize projects by difficulty
  const projectsByDifficulty = {
    Beginner: allProjects.filter(p => p.difficulty === 'Beginner'),
    Intermediate: allProjects.filter(p => p.difficulty === 'Intermediate'),
    Advanced: allProjects.filter(p => p.difficulty === 'Advanced'),
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await getUserProgress();
        setUserProgress(progress);
        
        // Count completed projects in each level
        const beginnerCompleted = Object.values(progress?.beginner || {}).filter((p: any) => p.completed).length;
        const intermediateCompleted = Object.values(progress?.intermediate || {}).filter((p: any) => p.completed).length;
        
        // Set active level based on completion
        if (beginnerCompleted < 3) {
          setActiveLevel('Beginner');
        } else if (intermediateCompleted < 3) {
          setActiveLevel('Intermediate');
        } else {
          setActiveLevel('Advanced');
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">React Learning Projects</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/admin/projects')}
              >
                <Settings className="h-4 w-4" />
                Manage Projects
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <ProgressTracker
          level={activeLevel}
          onProgressUpdate={handleRefresh}
        />

        <div className="space-y-8 mt-8">
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <DifficultySection
              key={level}
              title={level}
              projects={projectsByDifficulty[level]}
              isActive={level === activeLevel}
              progress={userProgress?.[level.toLowerCase()] || {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;