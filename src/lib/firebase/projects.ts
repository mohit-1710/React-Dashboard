import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { Project, DifficultyLevel } from '@/types/project';

const PROJECTS_COLLECTION = 'projects';

export const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Ensure steps array is properly structured
    const projectData = {
      ...project,
      steps: project.steps.map(step => ({
        title: step.title || '',
        description: step.description || '',
        codeTemplate: step.codeTemplate || ''
      })),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...project,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getProjects = async (difficulty?: DifficultyLevel) => {
  try {
    let q = query(
      collection(db, PROJECTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    if (difficulty) {
      q = query(q, where('difficulty', '==', difficulty));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

export const getProject = async (id: string) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Project;
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    console.log('Fetching project with ID:', projectId);
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectDoc = await getDoc(projectRef);
    
    console.log('Project doc exists:', projectDoc.exists());
    if (!projectDoc.exists()) {
      console.log('Project not found in database');
      return null;
    }
    
    const projectData = projectDoc.data();
    console.log('Raw project data:', projectData);
    
    // Convert Timestamps to strings
    const project = {
      id: projectDoc.id,
      ...projectData,
      createdAt: projectData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: projectData.updatedAt?.toDate?.()?.toISOString() || null,
    } as Project;
    
    console.log('Processed project data:', project);
    return project;
  } catch (error) {
    console.error('Error in getProjectById:', error);
    throw error;
  }
};

export const uploadResource = async (file: File, projectId: string) => {
  try {
    const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading resource:', error);
    throw error;
  }
};

export const deleteResource = async (url: string) => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};
