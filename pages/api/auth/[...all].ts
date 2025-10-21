import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { absoluteUrl } from '@/lib/absoluteUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return auth.handler(req, res);
}
