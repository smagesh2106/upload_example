const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.$connect();

module.exports = {
  prisma,
};
