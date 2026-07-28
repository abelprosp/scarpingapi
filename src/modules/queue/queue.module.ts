import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SearchProcessor } from './processors/search.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'search',
    }),
  ],
  providers: [SearchProcessor],
  exports: [BullModule],
})
export class QueueModule {}
