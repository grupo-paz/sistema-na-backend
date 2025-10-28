import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seed...');

  const firstAdmin = await prisma.admin.findFirst();

  if (firstAdmin) {
    console.log(
      'O banco de dados já possui um administrador. Seed não executado.',
    );
    return;
  }

  console.log('Nenhum administrador encontrado. Criando o primeiro...');

  const strongPassword = "Admin@2025!" 

  console.log('Criptografando senha padrão forte...');
  const hashedPassword = await bcrypt.hash(strongPassword, 10);

  await prisma.admin.create({
    data: {
      name: 'Admin Principal',
      email: 'admin@admin.com',
      password: hashedPassword,
    },
  });

  console.log('Primeiro administrador criado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
