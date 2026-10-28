import { PrismaClient } from '@prisma/client';

// Instância única do cliente ORM, compartilhada por todos os DAOs.
const prisma = new PrismaClient();

export default prisma;
