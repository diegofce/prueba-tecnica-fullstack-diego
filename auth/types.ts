// lib/auth/types.ts
import "better-auth";

declare module "better-auth" {
  interface User {
    role: "USER" | "ADMIN";
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "USER" | "ADMIN";
      emailVerified: boolean;
      image?: string;
    };
  }
}

export type Movement = {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
  userId: string;
  user: {
    name: string | null;
  };
};