import { resetStore } from './helpers/reset-store';
import { EventsService } from '../src/tickets/events/events.service';
import { ReservationsService } from '../src/tickets/reservations/reservations.service';
import { PaymentsService } from '../src/tickets/payments/payments.service';
import { JobsService } from '../src/tickets/jobs/jobs.service';
import { createBaseEvent } from './helpers/create-event';
import { store } from '../src/tickets/shared/inmem.store';

describe('PaymentsService - webhook', () => {
  let events: EventsService;
  let reservations: ReservationsService;
  let payments: PaymentsService;
  let jobs: JobsService;

  beforeEach(async () => {
    resetStore();
    events = new EventsService();
    reservations = new ReservationsService();
    payments = new PaymentsService();
    jobs = new JobsService();
    await createBaseEvent(events);
  });

  test('RECHAZADO no confirma la reserva ni marca la orden como pagada', () => {
    const hold = reservations.reserve({
      eventId: 'ev1',
      userId: 'u1',
      ttlMinutes: 15,
      seats: ['s1'],
    });

    const out = payments.webhook({
      orderId: hold.orderId,
      provider: 'VISA',
      providerPaymentId: 'pay_rej_001',
      status: 'REJECTED',
    });

    expect(out.kind).toBe('REJECTED');

    const order = store.orders.get(hold.orderId)!;
    const reservation = store.reservations.get(hold.reservationId)!;

    expect(order.status).toBe('PENDING_PAYMENT');
    expect(reservation.status).toBe('HOLD');

    // el asiento debe permanecer HELD hasta que expire
    expect(store.seatState.get(store.seatKey('ev1', 's1'))).toBe('HELD');
  });

  test('APROBADO confirma la reserva y marca el asiento como SOLD', () => {
    const hold = reservations.reserve({
      eventId: 'ev1',
      userId: 'u1',
      ttlMinutes: 15,
      seats: ['s1'],
    });

    const out = payments.webhook({
      orderId: hold.orderId,
      provider: 'VISA',
      providerPaymentId: 'pay_ok_001',
      status: 'APPROVED',
    });

    expect(out.kind).toBe('APPROVED');

    const order = store.orders.get(hold.orderId)!;
    const reservation = store.reservations.get(hold.reservationId)!;

    expect(order.status).toBe('PAID');
    expect(reservation.status).toBe('CONFIRMED');

    expect(store.seatState.get(store.seatKey('ev1', 's1'))).toBe('SOLD');
  });

  test('El webhook es idempotente por providerPaymentId', () => {
    const hold = reservations.reserve({
      eventId: 'ev1',
      userId: 'u1',
      ttlMinutes: 15,
      seats: ['s1'],
    });

    const out1 = payments.webhook({
      orderId: hold.orderId,
      provider: 'VISA',
      providerPaymentId: 'pay_ok_dup',
      status: 'APPROVED',
    });

    const out2 = payments.webhook({
      orderId: hold.orderId,
      provider: 'VISA',
      providerPaymentId: 'pay_ok_dup', // mismo id => idempotente
      status: 'APPROVED',
    });

    expect(out1.kind).toBe('APPROVED');
    expect(out2.kind).toBe('Lo siento, ya no está disponible(vendido)');
  });
});
