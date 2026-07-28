import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface SearchJobData {
  userId: string;
  type: string;
  query: string;
  options: Record<string, unknown>;
}

@Processor('search')
export class SearchProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchProcessor.name);

  async process(job: Job<SearchJobData>): Promise<unknown> {
    this.logger.log(`Processing search job ${job.id}: ${job.data.query}`);
    // Async search processing for batch/background jobs
    return { jobId: job.id, status: 'completed', query: job.data.query };
  }
}
