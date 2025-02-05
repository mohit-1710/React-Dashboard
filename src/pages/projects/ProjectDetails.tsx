import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getProject } from '@/lib/firebase/projects';

interface ProjectDetailsProps {
  projectId: string;
  onClose: () => void;
}

export function ProjectDetails({ projectId, onClose }: ProjectDetailsProps) {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  });

  if (!project) return null;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl mb-2">{project.title}</DialogTitle>
              <Badge
                variant={
                  project.difficulty === 'Beginner' ? 'default' :
                  project.difficulty === 'Intermediate' ? 'secondary' :
                  'destructive'
                }
              >
                {project.difficulty}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech.id} variant="outline">
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Project Steps</h3>
            <div className="space-y-6">
              {project.steps.map((step, index) => (
                <div key={step.id} className="space-y-3">
                  <h4 className="text-md font-semibold">
                    Step {index + 1}: {step.title}
                  </h4>
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  {step.explanation && (
                    <div className="bg-muted p-4 rounded-md">
                      <h5 className="font-medium mb-2">Additional Explanation</h5>
                      <p className="text-sm">{step.explanation}</p>
                    </div>
                  )}

                  {step.codeTemplate && (
                    <div className="bg-secondary/50 p-4 rounded-md">
                      <h5 className="font-medium mb-2">Code Template</h5>
                      <pre className="text-sm overflow-x-auto">
                        <code>{step.codeTemplate}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {project.resources.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Resources</h3>
                <div className="grid gap-2">
                  {project.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-secondary/50 rounded-md hover:bg-secondary transition-colors"
                    >
                      <span>{resource.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
