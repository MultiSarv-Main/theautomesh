import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const workflows = await prisma.workflow.findMany();
  console.log('Workflows:', workflows.map(w => ({
    id: w.id,
    name: w.name,
    pageId: w.pageId,
    rules: JSON.parse(w.rules)
  })));

  const lastLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Last 5 Leads:', lastLeads.map(l => ({
    id: l.id,
    facebookId: l.facebookId,
    formId: l.formId,
    data: JSON.parse(l.data)
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
