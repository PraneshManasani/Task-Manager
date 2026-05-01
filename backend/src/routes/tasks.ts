import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Create a task inside a project
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, projectId, assigneeId, dueDate } = req.body;
    
    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status or assignee
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, assigneeId } = req.body;
    
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Only Admin can reassign, Member can only update status
    const updateData: any = {};
    if (status) updateData.status = status;
    if (assigneeId !== undefined && req.user?.role === 'ADMIN') {
      updateData.assigneeId = assigneeId;
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
