import { Router, Request, Response } from 'express';
import { getProjects, getProjectById, addProject, updateProject, deleteProject, Project } from '../firestore';

const router = Router();

// GET /api/projects - Get all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await getProjects();
    // Convert Timestamp to ISO string for JSON response and map to expected format
    const formattedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.status || 'Ongoing', // Map status to category for backward compatibility
      image: project.image || '/images/project-placeholder.jpg',
      technologies: project.technologies || [],
      github: project.githubUrl || 'https://github.com'
    }));
    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await getProjectById(req.params.id);
    if (project) {
      const formattedProject = {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.status || 'Ongoing',
        image: project.image || '/images/project-placeholder.jpg',
        technologies: project.technologies || [],
        github: project.githubUrl || 'https://github.com'
      };
      res.json(formattedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, image, technologies, github } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const projectData: Omit<Project, 'id'> = {
      title,
      description,
      status: category || 'ongoing', // Map category to status
      image,
      technologies,
      githubUrl: github
    };

    const projectId = await addProject(projectData);
    if (projectId) {
      res.status(201).json({ id: projectId, message: 'Project created successfully' });
    } else {
      res.status(500).json({ message: 'Error creating project' });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, category, image, technologies, github } = req.body;

    const updateData: Partial<Project> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.status = category; // Map category to status
    if (image !== undefined) updateData.image = image;
    if (technologies !== undefined) updateData.technologies = technologies;
    if (github !== undefined) updateData.githubUrl = github;

    await updateProject(req.params.id, updateData);
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteProject(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
