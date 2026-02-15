import { Controller, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller()
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post('/jobs/release-expired')
  run() {
    return this.jobs.releaseExpired();
  }
}
