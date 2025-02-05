import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addProject, updateProject, uploadResource } from '@/lib/firebase/projects';
import type { Project, ProjectStep, Resource, TechStack } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [steps, setSteps] = useState<ProjectStep[]>(project?.steps || []);
  const [resources, setResources] = useState<Resource[]>(project?.resources || []);
  const [techStack, setTechStack] = useState<TechStack[]>(project?.techStack || []);
  const [newTech, setNewTech] = useState('');

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      difficulty: project?.difficulty || 'Beginner',
    },
  });

  const addStep = () => {
    setSteps([
      ...steps,
      {
        title: '',
        description: '',
        codeTemplate: ''
      },
    ]);
  };

  const updateStep = (index: number, field: keyof ProjectStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((step, i) => i !== index));
  };

  const addTechStack = () => {
    if (newTech.trim()) {
      setTechStack([
        ...techStack,
        { id: crypto.randomUUID(), name: newTech.trim() },
      ]);
      setNewTech('');
    }
  };

  const removeTechStack = (id: string) => {
    setTechStack(techStack.filter(tech => tech.id !== id));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    try {
      const url = await uploadResource(file, project?.id || 'temp');
      setResources([
        ...resources,
        {
          id: crypto.randomUUID(),
          title: file.name,
          type: 'other',
          url,
        },
      ]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      // Validate steps
      const validSteps = steps.map(step => ({
        title: step.title || '',
        description: step.description || '',
        codeTemplate: step.codeTemplate || ''
      }));

      const projectData = {
        ...values,
        steps: validSteps,
        resources,
        techStack,
      };

      if (project) {
        await updateProject(project.id, projectData);
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
      } else {
        const newProjectId = await addProject(projectData);
        console.log('Created new project with ID:', newProjectId);
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
        // Navigate to the new project
        navigate(`/projects/${newProjectId}`);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" placeholder="Enter project title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    className="min-h-[100px]"
                    placeholder="Enter project description" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tech Stack Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tech Stack</h2>
          <div className="flex gap-2">
            <Input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="Add technology..."
              className="max-w-sm"
            />
            <Button 
              type="button" 
              onClick={addTechStack}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {techStack.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full"
              >
                <span>{tech.name}</span>
                <button
                  type="button"
                  onClick={() => removeTechStack(tech.id)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Project Steps Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Project Steps</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Step {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                      placeholder="Enter step title"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder="Enter step description"
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Code Template (Optional)</label>
                    <Textarea
                      value={step.codeTemplate || ''}
                      onChange={(e) => updateStep(index, 'codeTemplate', e.target.value)}
                      placeholder="Enter code template"
                      className="mt-1.5 min-h-[150px] font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              onClick={addStep} 
              variant="outline" 
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </div>

        {/* Resources Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Resources</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full"
                >
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {resource.title}
                  </a>
                  <button
                    type="button"
                    onClick={() => setResources(resources.filter(r => r.id !== resource.id))}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full">
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
