import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isMember = req.user?.role === 'MEMBER';

    // Base filter for member (only see their assigned tasks, or all tasks if Admin)
    const taskFilter = isMember ? { assigneeId: req.user?.id } : {};

    const totalProjects = await prisma.project.count();

    const totalTasks = await prisma.task.count({ where: taskFilter });

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: taskFilter,
      _count: { status: true }
    });

    const overdueTasks = await prisma.task.count({
      where: {
        ...taskFilter,
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      }
    });

    // Format status counts
    const statusCounts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasksByStatus.forEach(t => {
      statusCounts[t.status] = t._count.status;
    });

    const tasksList = await prisma.task.findMany({
      where: taskFilter,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      totalProjects,
      totalTasks,
      statusCounts,
      overdueTasks,
      tasks: tasksList
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
