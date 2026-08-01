import { PrismaClient, PlanTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Gratuito',
      tier: PlanTier.FREE,
      description: 'Experimente a infraestrutura Noviq para agentes de IA',
      priceMonthly: 0,
      priceYearly: 0,
      creditsMonthly: 500,
      rateLimit: 20,
      maxApiKeys: 1,
      features: [
        '500 créditos ao cadastrar',
        '20 req/min',
        '1 API Key',
        'Search, Images, News',
      ],
    },
    {
      name: 'Starter',
      tier: PlanTier.STARTER,
      description: 'Para automações, protótipos e primeiros agentes',
      priceMonthly: 3900,
      priceYearly: 39000,
      creditsMonthly: 12000,
      rateLimit: 60,
      maxApiKeys: 3,
      features: [
        '12.000 créditos/mês',
        '60 req/min',
        '3 API Keys',
        'Todas as APIs SERP',
        'Crawl, Extract, Browser',
        'Research API',
        'MCP Server',
        'Pay-as-you-go via PIX',
      ],
    },
    {
      name: 'Pro',
      tier: PlanTier.PRO,
      description: 'Para agentes e produtos em produção',
      priceMonthly: 14900,
      priceYearly: 149000,
      creditsMonthly: 50000,
      rateLimit: 200,
      maxApiKeys: 10,
      features: [
        '50.000 créditos/mês',
        '200 req/min',
        '10 API Keys',
        'Deep Research & Agent API',
        'Embeddings & RAG',
        'Suporte prioritário',
      ],
    },
    {
      name: 'Business',
      tier: PlanTier.ENTERPRISE,
      description: 'Alto volume, times e analytics avançado',
      priceMonthly: 49900,
      priceYearly: 499000,
      creditsMonthly: 200000,
      rateLimit: 500,
      maxApiKeys: 25,
      features: [
        '200.000 créditos/mês',
        '500 req/min',
        '25 API Keys',
        'Múltiplos projetos',
        'Auditoria e analytics',
        'Onboarding assistido',
        'Enterprise custom sob consulta',
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  const adminEmail = 'admin@noviqsearch.local';
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      name: 'Administrador NoviqSearch',
      role: 'SUPER_ADMIN',
      credits: 1000000,
      emailVerified: true,
    },
  });

  console.log('Seed concluído: planos Gratuito/Starter/Pro/Business + admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
