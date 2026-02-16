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
    resetStore();
    events = new EventsService();
    reservations = new ReservationsService();
    jobs = new JobsService();
    await createBaseEvent(events);
  });

  test('libera un HOLD de asiento vencido: HELD -> FREE y reserva -> EXPIRED', async () => {
    const hold = reservations.reserve({
      eventId: 'ev1',
      userId: 'u1',
      ttlMinutes: 0.001,
      seats: ['s1'],
    });

    expect(store.seatState.get(store.seatKey('ev1', 's1'))).toBe('HELD');

    await new Promise((r) => setTimeout(r, 50));

    const out = jobs.releaseExpired();
    expect(out.released).toBeGreaterThanOrEqual(1);

    expect(store.seatState.get(store.seatKey('ev1', 's1'))).toBe('FREE');
    expect(store.reservations.get(hold.reservationId)!.status).toBe('EXPIRED');
  });

  test('el job es idempotente: ejecutarlo dos veces no libera de más (vía API)', async () => {
  const hold = reservations.reserve({
    eventId: 'ev1',
    userId: 'u3',
    ttlMinutes: 0.001,
    general: [{ ticketTypeId: 'gen', qty: 1 }],
  });

  await new Promise((r) => setTimeout(r, 200));

  const res1 = await fetch('http://127.0.0.1:3000/jobs/release-expired', {
    method: 'POST',
  });
  const out1 = await res1.json();

  const res2 = await fetch('http://127.0.0.1:3000/jobs/release-expired', {
    method: 'POST',
  });
  const out2 = await res2.json();

  const released1 = out1?.data?.released ?? out1?.released ?? 0;
  const released2 = out2?.data?.released ?? out2?.released ?? 0;

  expect(released1).toBeGreaterThanOrEqual(1);
  expect(released2).toBe(0);

  expect(store.reservations.get(hold.reservationId)!.status).toBe('EXPIRED');
});
});
