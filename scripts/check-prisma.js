const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  const projects = await prisma.project.findMany();
  console.log(JSON.stringify(projects));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
