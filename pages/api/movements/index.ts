// ...existing code...
import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { absoluteUrl } from '@/lib/absoluteUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) return res.status(401).json({ error: 'No autenticado' });

    if (req.method === 'GET') {
      const movements = await prisma.movement.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(movements);
    }

    if (req.method === 'POST') {
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acceso denegado: Solo administradores' });
      }

      const { concept, amount, type, date } = req.body ?? {};

      if (!concept || amount == null || !type || !date) {
        return res.status(400).json({ message: 'Campos incompletos' });
      }

      const created = await prisma.movement.create({
        data: {
          concept: String(concept),
          amount: new Prisma.Decimal(String(amount)),
          type: String(type) as any,
          date: new Date(date),
          userId: session.user.id,
        },
      });

      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'MÃ©todo no permitido' });
  } catch (error) {
    console.error('/api/movements error:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
// ...existing code...
