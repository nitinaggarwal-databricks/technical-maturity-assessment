import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { CopsModule } from './cops/cops.module';
import { EventsModule } from './events/events.module';
import { ContentModule } from './content/content.module';
import { SurveysModule } from './surveys/surveys.module';
import { KpisModule } from './kpis/kpis.module';
import { UsecasesModule } from './usecases/usecases.module';
import { ChampionsModule } from './champions/champions.module';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    CopsModule,
    EventsModule,
    ContentModule,
    SurveysModule,
    KpisModule,
    UsecasesModule,
    ChampionsModule,
  ],
})
export class AppModule {}

