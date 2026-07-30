import { PrismaClient, PlanTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Grátis',
      tier: PlanTier.FREE,
      description: 'Comece com créditos gratuitos ao criar sua conta',
      priceMonthly: 0,
      priceYearly: 0,
      creditsMonthly: 2700,
      rateLimit: 20,
      maxApiKeys: 1,
      features: [
        '2.700 créditos ao cadastrar',
        '20 req/min',
        '1 API Key',
        'Busca web, imagens, mapas',
      ],
    },
    {
      name: 'Plano Mensal',
      tier: PlanTier.STARTER,
      description: '70.000 créditos por mês — ideal para produção',
      priceMonthly: 19700,
      priceYearly: 197000,
      creditsMonthly: 70000,
      rateLimit: 120,
      maxApiKeys: 5,
      features: [
        '70.000 créditos/mês',
        '120 req/min',
        '5 API Keys',
        'Todas as APIs SERP',
        'APIs avançadas (Crawl, Research, RAG)',
        'Pay-as-you-go via PIX',
        'Suporte prioritário',
      ],
    },
    {
      name: 'Pro',
      tier: PlanTier.PRO,
      description: 'Para equipes com demanda elevada',
      priceMonthly: 49700,
      priceYearly: 497000,
      creditsMonthly: 350000,
      rateLimit: 400,
      maxApiKeys: 15,
      features: [
        '350.000 créditos/mês',
        '400 req/min',
        '15 API Keys',
        'Batch search ilimitado',
        'Suporte dedicado',
      ],
    },
    {
      name: 'Enterprise',
      tier: PlanTier.ENTERPRISE,
      description: 'Volume customizado e SLA',
      priceMonthly: 99700,
      priceYearly: 997000,
      creditsMonthly: 2000000,
      rateLimit: 1000,
      maxApiKeys: 50,
      features: [
        '2M+ créditos/mês',
        '1000 req/min',
        '50 API Keys',
        'SLA 99.9%',
        'Infra dedicada',
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

  console.log('NoviqSearch seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
