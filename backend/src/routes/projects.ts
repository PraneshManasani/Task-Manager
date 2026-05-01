import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get all projects
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user!.id
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
