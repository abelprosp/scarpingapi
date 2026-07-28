import { PrismaClient, PlanTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Free',
      tier: PlanTier.FREE,
      description: 'Plano gratuito com créditos limitados',
      priceMonthly: 0,
      priceYearly: 0,
      creditsMonthly: 2500,
      rateLimit: 10,
      maxApiKeys: 1,
      features: ['2.500 créditos/mês', '10 req/min', '1 API Key'],
    },
    {
      name: 'Starter',
      tier: PlanTier.STARTER,
      description: 'Ideal para startups e projetos pequenos',
      priceMonthly: 4900,
      priceYearly: 49000,
      creditsMonthly: 50000,
      rateLimit: 60,
      maxApiKeys: 3,
      features: ['50.000 créditos/mês', '60 req/min', '3 API Keys', 'Suporte email'],
    },
    {
      name: 'Pro',
      tier: PlanTier.PRO,
      description: 'Para equipes e aplicações em produção',
      priceMonthly: 19900,
      priceYearly: 199000,
      creditsMonthly: 250000,
      rateLimit: 300,
      maxApiKeys: 10,
      features: ['250.000 créditos/mês', '300 req/min', '10 API Keys', 'Suporte prioritário', 'Batch search'],
    },
    {
      name: 'Enterprise',
      tier: PlanTier.ENTERPRISE,
      description: 'Solução customizada para grandes volumes',
      priceMonthly: 99900,
      priceYearly: 999000,
      creditsMonthly: 2000000,
      rateLimit: 1000,
      maxApiKeys: 50,
      features: ['2M créditos/mês', '1000 req/min', '50 API Keys', 'SLA 99.9%', 'Dedicated support'],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  const adminEmail = 'admin@serper.local';
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
      credits: 1000000,
      emailVerified: true,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
