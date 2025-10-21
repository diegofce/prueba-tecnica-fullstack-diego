// pages/api/test-db.ts
import prisma from "@/lib/prisma";
import { absoluteUrl } from '@/lib/absoluteUrl';

export default async function handler(req, res) {
  const users = await prisma.user.findMany();
  res.status(200).json({ users });
}
