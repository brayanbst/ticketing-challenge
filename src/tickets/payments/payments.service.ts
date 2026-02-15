import { BadRequestException, Injectable } from '@nestjs/common';
import { store } from '../shared/inmem.store';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Injectable()
export class PaymentsService {
  webhook(dto: PaymentWebhookDto) {
    if (store.paymentProviderIds.has(dto.providerPaymentId)) {
      return { kind: 'Lo siento, ya no está disponible(vendido)' as const };
    }

    const order = store.orders.get(dto.orderId);
    if (!order) throw new BadRequestException('OrderNotFound');

    const reservation = store.reservations.get(order.reservationId);
    if (!reservation) throw new BadRequestException('ReservationNotFound');

    store.paymentProviderIds.add(dto.providerPaymentId);

    if (dto.status === 'REJECTED') return { kind: 'REJECTED' as const };

    const now = Date.now();
    if (reservation.status !== 'HOLD') throw new BadRequestException('ReservationNotHold');
    if (reservation.expiresAt <= now) throw new BadRequestException('ReservationExpired');

    reservation.status = 'CONFIRMED';
    order.status = 'PAID';

    for (const it of reservation.items) {
      if (it.kind === 'SEAT') {
        const key = store.seatKey(order.eventId, it.seatId);
        store.seatState.set(key, 'SOLD');
      }
    }

    return { kind: 'APPROVED' as const, orderStatus: order.status, reservationStatus: reservation.status };
  }
}
