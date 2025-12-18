import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function computeDailyKpis() {
  console.log('Computing daily KPIs...');

  const cops = await prisma.cop.findMany({ where: { isActive: true } });

  const today = new Date();
  const metricDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  for (const cop of cops) {
    console.log(`Processing CoP: ${cop.name}`);

    // MAP = number of unique attendees in last 30 days
    const mapSince = new Date(metricDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const attendances = await prisma.eventAttendance.findMany({
      where: {
        event: { copId: cop.id },
        attended: true,
        joinedAt: { gte: mapSince },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    const mapCount = attendances.length;

    // NPS = approximate from all 'nps' answers for this CoP (last 90 days)
    const npsSince = new Date(metricDate.getTime() - 90 * 24 * 60 * 60 * 1000);

    const npsAnswers = await prisma.surveyAnswer.findMany({
      where: {
        question: {
          survey: { copId: cop.id },
          questionType: 'nps',
        },
        response: {
          submittedAt: { gte: npsSince },
        },
      },
    });

    let nps = null;
    if (npsAnswers.length > 0) {
      const values = npsAnswers
        .map((a) => Number(a.answerValue))
        .filter((n) => !isNaN(n));
      const promoters = values.filter((v) => v >= 9).length;
      const detractors = values.filter((v) => v <= 6).length;
      const npsScore =
        ((promoters - detractors) / (values.length || 1)) * 100.0;
      nps = npsScore;
    }

    if (mapCount > 0) {
      await prisma.kpiMetric.upsert({
        where: {
          copId_metricName_metricDate: {
            copId: cop.id,
            metricName: 'MAP',
            metricDate,
          },
        },
        update: { metricValue: mapCount },
        create: {
          copId: cop.id,
          metricName: 'MAP',
          metricValue: mapCount,
          metricDate,
        },
      });
      console.log(`  ✓ MAP: ${mapCount}`);
    }

    if (nps !== null) {
      await prisma.kpiMetric.upsert({
        where: {
          copId_metricName_metricDate: {
            copId: cop.id,
            metricName: 'NPS',
            metricDate,
          },
        },
        update: { metricValue: nps },
        create: {
          copId: cop.id,
          metricName: 'NPS',
          metricValue: nps,
          metricDate,
        },
      });
      console.log(`  ✓ NPS: ${nps.toFixed(2)}`);
    }
  }

  console.log('✓ Daily KPIs computed.');
}

computeDailyKpis()
  .catch((e) => {
    console.error('❌ Error computing KPIs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


