import { getServerSession } from 'next-auth'; 
import { authOptions } from './index'; 
import { NextApiRequest, NextApiResponse } from 'next';
// ⭐ Asegúrate de que esta línea esté presente y correcta:
import { Role } from '@prisma/client'; 

/**
 * Función para obtener la sesión del usuario con el rol incluido
 */
export const getAuthSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  return session;
};

/**
 * Función para proteger rutas API basada en roles (RBAC)
 * @param session Objeto de sesión (debe incluir session.user.role)
 * @param requiredRole El rol de Prisma requerido para acceder
 */
export const checkApiRole = (session: any, requiredRole: Role): boolean => {
    // Si la sesión o el rol no existen, denegar
    const userRole = session?.user?.role;
    if (!userRole) return false;

    // Si el rol del usuario es igual al rol requerido, o si es ADMIN
    // y el rol requerido es de menor jerarquía (si aplicara), permitir.
    // Para esta lógica simple, solo verificamos igualdad.
    if (requiredRole === Role.ADMIN) {
        return userRole === Role.ADMIN;
    }
    
    // Si la función se llama con Role.USER, cualquiera autenticado (USER o ADMIN) pasa
    return true; 
}
