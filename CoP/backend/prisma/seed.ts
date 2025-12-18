import { PrismaClient, CopPhase } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // USERS
  const nitin = await prisma.user.upsert({
    where: { email: 'nitin@databricks.com' },
    update: {},
    create: {
      email: 'nitin@databricks.com',
      fullName: 'Nitin Aggarwal',
      company: 'Databricks',
      role: 'databricks_internal',
      persona: 'SA',
    },
  });

  const takedaExec = await prisma.user.upsert({
    where: { email: 'exec@takeda.com' },
    update: {},
    create: {
      email: 'exec@takeda.com',
      fullName: 'Takeda Exec Sponsor',
      company: 'Takeda',
      role: 'customer_exec',
      persona: 'Exec',
    },
  });

  const takedaChampion = await prisma.user.upsert({
    where: { email: 'champion@takeda.com' },
    update: {},
    create: {
      email: 'champion@takeda.com',
      fullName: 'Takeda CoP Champion',
      company: 'Takeda',
      role: 'customer_member',
      persona: 'DE',
    },
  });

  const cignaExec = await prisma.user.upsert({
    where: { email: 'exec@cigna.com' },
    update: {},
    create: {
      email: 'exec@cigna.com',
      fullName: 'Cigna Exec Sponsor',
      company: 'Cigna Healthcare',
      role: 'customer_exec',
      persona: 'Exec',
    },
  });

  console.log('✓ Users created');

  // CUSTOMERS
  const takeda = await prisma.customer.upsert({
    where: { id: 'takeda-001' },
    update: {},
    create: {
      id: 'takeda-001',
      name: 'Takeda',
      industry: 'Healthcare & Life Sciences',
      region: 'Global',
      accountOwner: 'Databricks AE',
    },
  });

  const cigna = await prisma.customer.upsert({
    where: { id: 'cigna-001' },
    update: {},
    create: {
      id: 'cigna-001',
      name: 'Cigna Healthcare',
      industry: 'Healthcare & Life Sciences',
      region: 'US',
      accountOwner: 'Databricks AE',
    },
  });

  console.log('✓ Customers created');

  // CoPs
  const takedaCop = await prisma.cop.upsert({
    where: { id: 'takeda-cop-001' },
    update: {},
    create: {
      id: 'takeda-cop-001',
      customerId: takeda.id,
      name: 'Takeda Databricks CoP',
      mission:
        'Drive Databricks adoption and best-practice sharing across Takeda teams.',
      vision:
        'A self-sustaining community of champions accelerating AI & analytics outcomes.',
      phase: CopPhase.GROWTH,
      isActive: true,
      createdById: nitin.id,
      startDate: new Date('2024-01-10'),
    },
  });

  const cignaCop = await prisma.cop.upsert({
    where: { id: 'cigna-cop-001' },
    update: {},
    create: {
      id: 'cigna-cop-001',
      customerId: cigna.id,
      name: 'Cigna Databricks CoP',
      mission:
        'Accelerate claims analytics, GenAI and self-service BI with Databricks.',
      vision:
        'Empower Cigna teams to build & operate AI workloads on a governed, scalable platform.',
      phase: CopPhase.LAUNCH,
      isActive: true,
      createdById: nitin.id,
      startDate: new Date('2024-04-01'),
    },
  });

  console.log('✓ CoPs created');

  // Memberships
  await prisma.copMembership.createMany({
    data: [
      {
        copId: takedaCop.id,
        userId: nitin.id,
        membershipRole: 'cop_lead',
      },
      {
        copId: takedaCop.id,
        userId: takedaExec.id,
        membershipRole: 'exec_sponsor',
      },
      {
        copId: takedaCop.id,
        userId: takedaChampion.id,
        membershipRole: 'champion',
      },
      {
        copId: cignaCop.id,
        userId: nitin.id,
        membershipRole: 'cop_lead',
      },
      {
        copId: cignaCop.id,
        userId: cignaExec.id,
        membershipRole: 'exec_sponsor',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Memberships created');

  // Events
  const takedaEvent1 = await prisma.event.create({
    data: {
      copId: takedaCop.id,
      title: 'Databricks 101 & Governance Overview',
      description: 'Intro to Databricks platform + Unity Catalog for Takeda.',
      eventType: 'training',
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: 'Zoom',
      createdById: nitin.id,
    },
  });

  await prisma.event.create({
    data: {
      copId: takedaCop.id,
      title: 'GenAI Use Cases in HLS',
      description: 'Discussion of GenAI use cases & patterns for Takeda.',
      eventType: 'deep_dive',
      startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Teams',
      createdById: nitin.id,
    },
  });

  await prisma.event.create({
    data: {
      copId: cignaCop.id,
      title: 'Unity Catalog for Claims Analytics',
      description: 'How to secure and govern claims data with UC.',
      eventType: 'training',
      startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: 'Zoom',
      createdById: nitin.id,
    },
  });

  console.log('✓ Events created');

  // Content
  await prisma.contentAsset.createMany({
    data: [
      {
        copId: takedaCop.id,
        title: 'Takeda CoP Kickoff Deck',
        description: 'Slide deck used for the Takeda CoP kickoff session.',
        url: 'https://databricks.com/resources/takeda-cop-kickoff',
        assetType: 'deck',
        skillLevel: 'beginner',
        personaTag: 'Exec',
        tags: ['kickoff', 'strategy'],
        createdById: nitin.id,
      },
      {
        copId: takedaCop.id,
        title: 'Unity Catalog Governance Deep Dive',
        description: 'Governance best practices & reference patterns.',
        url: 'https://databricks.com/resources/uc-governance',
        assetType: 'deck',
        skillLevel: 'intermediate',
        personaTag: 'DE',
        tags: ['governance', 'unity-catalog'],
        createdById: nitin.id,
      },
      {
        copId: null,
        title: 'Databricks Academy – Generative AI Fundamentals',
        description: 'Foundational training path for GenAI.',
        url: 'https://academy.databricks.com/catalog/genai-fundamentals',
        assetType: 'course',
        skillLevel: 'beginner',
        personaTag: 'All',
        tags: ['training', 'genai'],
        createdById: nitin.id,
      },
      {
        copId: null,
        title: 'Data Engineering with Databricks',
        description: 'Complete data engineering curriculum.',
        url: 'https://academy.databricks.com/catalog/data-engineer',
        assetType: 'course',
        skillLevel: 'intermediate',
        personaTag: 'DE',
        tags: ['training', 'data-engineering'],
        createdById: nitin.id,
      },
    ],
  });

  console.log('✓ Content created');

  // Survey for the Takeda event
  const questions = await prisma.surveyQuestion.findMany({
    where: { survey: { copId: takedaCop.id } },
  });

  let survey;
  if (questions.length === 0) {
    survey = await prisma.survey.create({
      data: {
        copId: takedaCop.id,
        eventId: takedaEvent1.id,
        surveyType: 'session_feedback',
        title: 'Takeda CoP – Kickoff Feedback',
        createdById: nitin.id,
      },
    });

    const q1 = await prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        questionText: 'How useful was this session (1-5)?',
        questionType: 'rating',
        position: 0,
      },
    });

    const q2 = await prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        questionText: 'Would you recommend this CoP to colleagues (0-10)?',
        questionType: 'nps',
        position: 1,
      },
    });

    const q3 = await prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        questionText: 'What worked well?',
        questionType: 'free_text',
        position: 2,
      },
    });

    const q4 = await prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        questionText: 'What could be improved?',
        questionType: 'free_text',
        position: 3,
      },
    });

    // Sample responses
    const response1 = await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        userId: takedaChampion.id,
      },
    });

    await prisma.surveyAnswer.createMany({
      data: [
        { responseId: response1.id, questionId: q1.id, answerValue: '5' },
        { responseId: response1.id, questionId: q2.id, answerValue: '9' },
        {
          responseId: response1.id,
          questionId: q3.id,
          answerValue: 'Great overview and clear roadmap.',
        },
        {
          responseId: response1.id,
          questionId: q4.id,
          answerValue: 'More live demos next time.',
        },
      ],
    });

    const response2 = await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        userId: takedaExec.id,
      },
    });

    await prisma.surveyAnswer.createMany({
      data: [
        { responseId: response2.id, questionId: q1.id, answerValue: '4' },
        { responseId: response2.id, questionId: q2.id, answerValue: '8' },
        {
          responseId: response2.id,
          questionId: q3.id,
          answerValue: 'Good strategic alignment.',
        },
        {
          responseId: response2.id,
          questionId: q4.id,
          answerValue: 'Would like more business case examples.',
        },
      ],
    });

    console.log('✓ Survey created with responses');
  }

  // Use Case
  await prisma.useCase.upsert({
    where: { id: 'takeda-uc-001' },
    update: {},
    create: {
      id: 'takeda-uc-001',
      copId: takedaCop.id,
      title: 'Standardized Data Governance for Clinical Analytics',
      problem:
        'Multiple teams used inconsistent access patterns and legacy processes.',
      solution:
        'Implemented Unity Catalog, standard catalogs/schemas, and lineage across key datasets.',
      architectureUrl: 'https://databricks.com/architecture/takeda-uc',
      productsUsed: ['Unity Catalog', 'Databricks SQL', 'Delta Lake'],
      outcomes:
        'Reduced time-to-onboard new teams from months to weeks; improved auditability.',
      businessImpact: {
        time_saved_pct: 50,
        audit_findings_reduction_pct: 40,
      },
      createdById: nitin.id,
    },
  });

  console.log('✓ Use case created');

  // Champion
  await prisma.champion.upsert({
    where: {
      copId_userId_month_awardType: {
        copId: takedaCop.id,
        userId: takedaChampion.id,
        month: new Date('2024-10-01'),
        awardType: 'brickster_of_the_month',
      },
    },
    update: {},
    create: {
      copId: takedaCop.id,
      userId: takedaChampion.id,
      month: new Date('2024-10-01'),
      awardType: 'brickster_of_the_month',
      citation:
        'For leading the migration of critical pipelines to Databricks and evangelizing best practices.',
      createdById: nitin.id,
    },
  });

  console.log('✓ Champion created');

  // KPIs – seed a few data points for MAP, NPS
  const today = new Date();
  const days = [60, 30, 15, 0];
  for (const d of days) {
    const date = new Date(today.getTime() - d * 24 * 60 * 60 * 1000);
    await prisma.kpiMetric.upsert({
      where: {
        copId_metricName_metricDate: {
          copId: takedaCop.id,
          metricName: 'MAP',
          metricDate: date,
        },
      },
      update: {},
      create: {
        copId: takedaCop.id,
        metricName: 'MAP',
        metricValue: 15 + (60 - d) / 2,
        metricDate: date,
      },
    });

    await prisma.kpiMetric.upsert({
      where: {
        copId_metricName_metricDate: {
          copId: takedaCop.id,
          metricName: 'NPS',
          metricDate: date,
        },
      },
      update: {},
      create: {
        copId: takedaCop.id,
        metricName: 'NPS',
        metricValue: 60 + (60 - d) / 3,
        metricDate: date,
      },
    });
  }

  console.log('✓ KPIs created');

  console.log('\n═══════════════════════════════════════════');
  console.log('✓ Seed completed successfully!');
  console.log('═══════════════════════════════════════════\n');
  console.log('🔑 Use this user ID for fake auth:');
  console.log(`   ${nitin.id}`);
  console.log('\n📝 Add to frontend/.env.local:');
  console.log(`   NEXT_PUBLIC_FAKE_USER_ID=${nitin.id}`);
  console.log('\n👥 Sample users:');
  console.log(`   - Nitin (SA): ${nitin.email}`);
  console.log(`   - Takeda Exec: ${takedaExec.email}`);
  console.log(`   - Takeda Champion: ${takedaChampion.email}`);
  console.log('\n🏢 Customers:');
  console.log(`   - Takeda (${takedaCop.name})`);
  console.log(`   - Cigna (${cignaCop.name})`);
  console.log('\n═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


