import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
      }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'super-secret-jwt-key', {
      expiresIn: '7d'
    });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'super-secret-jwt-key', {
      expiresIn: '7d'
    });

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if(!token) {
            res.status(401).json({error: 'No token'});
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key') as { id: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: {id: true, name: true, email: true, role: true} });
        if(!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        res.json({user});
    } catch(e) {
        res.status(401).json({error: 'Invalid token'});
    }
});

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true }});
    res.json(users);
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
