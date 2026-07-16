import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pendingJobs = await prisma.job.count({ where: { status: 'PENDING' } });
  const failedJobs = await prisma.job.count({ where: { status: 'FAILED' } });
  const totalLeads = await prisma.lead.count();
  const totalExecutions = await prisma.workflowExecution.count();
  
  console.log({ pendingJobs, failedJobs, totalLeads, totalExecutions });
  
  if (failedJobs > 0) {
    const lastFailed = await prisma.job.findFirst({
      where: { status: 'FAILED' },
      orderBy: { updatedAt: 'desc' }
    });
    console.log('Last Failed Job:', JSON.stringify(lastFailed, null, 2));
  }

  const lastExecutions = await prisma.workflowExecution.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Last 5 Executions:', JSON.stringify(lastExecutions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
