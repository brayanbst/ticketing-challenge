import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { JobsModule } from './jobs/jobs.module';
import { PaymentsModule } from './payments/payments.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [EventsModule, ReservationsModule, PaymentsModule, JobsModule],
})
export class TicketsModule {}
