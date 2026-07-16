import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDb() {
  console.log("--- DB DIAGNOSTICS ---");
  const users = await prisma.user.findMany();
  console.log(`Total Users: ${users.length}`);
  users.forEach(u => console.log(`  User: ${u.email} (ID: ${u.id})`));

  const pages = await prisma.page.findMany();
  console.log(`Total Pages: ${pages.length}`);
  pages.forEach(p => console.log(`  Page: ${p.name} (ID: ${p.id}) -> UserID: ${p.userId} | Status: ${p.sub}`));
  
  const workflows = await prisma.workflow.findMany();
  console.log(`Total Workflows: ${workflows.length}`);

  console.log("--- END DIAGNOSTICS ---");
}

checkDb()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
