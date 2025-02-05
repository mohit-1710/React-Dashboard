import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById } from '@/lib/firebase/projects';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import type { Project } from '@/types/project';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getUserProgress, updateProjectProgress } = useAuth();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/projects/${projectId}` } });
    }
  }, [user, projectId, navigate]);

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) {
        console.error('No project ID provided');
        throw new Error('No project ID provided');
      }
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('Fetching project:', projectId);
      const result = await getProjectById(projectId);
      if (!result) {
        console.error('Project not found:', projectId);
        throw new Error('Project not found');
      }
      return result;
    },
    enabled: !!projectId && !!user,
    retry: 1,
    onError: (error) => {
      console.error('Error loading project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load project',
        variant: 'destructive',
      });
      navigate('/not-found');
    }
  });

  useEffect(() => {
    const checkCompletion = async () => {
      if (!project) return;
      const progress = await getUserProgress();
      const projectProgress = progress?.[project.difficulty.toLowerCase()]?.[project.id];
      setIsCompleted(!!projectProgress?.completed);
    };
    checkCompletion();
  }, [project, user]);

  const handleStepClick = (index: number) => {
    setActiveStep(activeStep === index ? null : index);
  };

  const handleToggleCompletion = async () => {
    if (!project) return;
    try {
      await updateProjectProgress(project.id, project.difficulty, !isCompleted);
      setIsCompleted(!isCompleted);
      toast({
        title: isCompleted ? 'Project marked as incomplete' : 'Project marked as complete',
        description: isCompleted
          ? 'Your progress has been updated'
          : 'Congratulations on completing this project!',
      });
    } catch (error) {
      console.error('Error updating project progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project progress',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-lg">Loading project details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return null; // Will be redirected by onError
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-card rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <p className="text-muted-foreground mb-4">{project.description}</p>
            </div>
            <Button
              variant={isCompleted ? "destructive" : "default"}
              onClick={handleToggleCompletion}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline">{project.difficulty}</Badge>
            {project.techStack.map((tech) => (
              <Badge key={tech.id} variant="secondary">
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Steps Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Steps</h2>
            {project.steps.map((step, index) => (
              <Collapsible
                key={index}
                open={activeStep === index}
                onOpenChange={() => handleStepClick(index)}
              >
                <Card className="p-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <span className="font-medium">
                      Step {index + 1}: {step.title}
                    </span>
                    {activeStep === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <p className="text-muted-foreground">{step.description}</p>
                    {step.codeTemplate && (
                      <pre className="mt-4 p-4 bg-muted rounded-lg overflow-x-auto">
                        <code>{step.codeTemplate}</code>
                      </pre>
                    )}
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {/* Code Template Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Code Template</h2>
            <Card className="h-[calc(100vh-20rem)]">
              <ScrollArea className="h-full">
                <pre className="p-4">
                  <code className="text-sm">
                    {activeStep !== null && project.steps[activeStep].codeTemplate
                      ? project.steps[activeStep].codeTemplate
                      : 'Select a step to view its code template'}
                  </code>
                </pre>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;