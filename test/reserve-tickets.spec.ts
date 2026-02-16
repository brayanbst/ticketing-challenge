import { resetStore } from './helpers/reset-store';
import { EventsService } from '../src/tickets/events/events.service';
import { ReservationsService } from '../src/tickets/reservations/reservations.service';
import { JobsService } from '../src/tickets/jobs/jobs.service';
import { createBaseEvent } from './helpers/create-event';
import { store } from '../src/tickets/shared/inmem.store';

describe('JobsService - releaseExpired', () => {
  let events: EventsService;
  let reservations: ReservationsService;
  let jobs: JobsService;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    resetStore();
    events = new EventsService();
    reservations = new ReservationsService();
    jobs = new JobsService();
    await createBaseEvent(events);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('libera un HOLD de asiento vencido: HELD -> FREE y reserva -> EXPIRED', () => {
    const hold = reservations.reserve({
      eventId: 'ev1',
      userId: 'u1',
      ttlMinutes: 0.001,
      seats: ['s1'],
    });

    expect(store.seatState.get(store.seatKey('ev1', 's1'))).toBe('HELD');

    jest.advanceTimersByTime(500);

    const out = jobs.releaseExpired();
    expect(out.released).toBeGreaterThanOrEqual(1);

    expect(store.seatState.get(store.seatKey('ev1', 's1'))).toBe('FREE');
    expect(store.reservations.get(hold.reservationId)!.status).toBe('EXPIRED');
  });
});
