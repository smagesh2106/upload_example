const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const Animal = require("../data/animal");

async function runSeeders() {
  // Permissions
  await Promise.all(
    Animal.map(
      async (perm) =>
        await prisma.Animal.upsert({
          where: { name: perm.name },
          update: {},
          create: perm,
        })
    )
  );
  await prisma.$disconnect;
}

runSeeders();
