import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seed...');

  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !defaultPassword) {
    console.error("Erro: As variáveis de ambiente SUPER_ADMIN_EMAIL e SUPER_ADMIN_PASSWORD devem estar definidas no .env");
    process.exit(1);
  }

  const firstAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (firstAdmin) {
    console.log(`O administrador ${adminEmail} já existe. Seed não executado.`);
    return;
  }
  console.log('Nenhum administrador encontrado. Criando o primeiro...');

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  await prisma.admin.create({
    data: {
      name: 'Admin Principal (Equipe)',
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('Primeiro administrador criado com sucesso!');
  console.log(`Login: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });