import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { store, ReservationItem } from '../shared/inmem.store';
import { ReserveDto } from './dto/reserve.dto';

@Injectable()
export class ReservationsService {
  private MAX_PER_USER = 5;

  reserve(dto: ReserveDto) {
    const ev = store.events.get(dto.eventId);
    if (!ev) throw new BadRequestException('EventNotFound');

    const items: ReservationItem[] = [];
    for (const s of dto.seats ?? []) items.push({ kind: 'SEAT', seatId: s });
    for (const g of dto.general ?? []) items.push({ kind: 'GENERAL', ticketTypeId: g.ticketTypeId, qty: g.qty });

    if (!items.length) throw new BadRequestException('NoItems');

    const now = Date.now();
    const activeQty = [...store.reservations.values()]
      .filter(r => r.eventId === dto.eventId && r.userId === dto.userId)
      .filter(r => r.status === 'CONFIRMED' || (r.status === 'HOLD' && r.expiresAt > now))
      .reduce((acc, r) => acc + r.items.reduce((s, it) => s + (it.kind === 'SEAT' ? 1 : it.qty), 0), 0);

    const reqQty = items.reduce((s, it) => s + (it.kind === 'SEAT' ? 1 : it.qty), 0);
    if (activeQty + reqQty > this.MAX_PER_USER) throw new BadRequestException(`Excediste el limite de tickets por usuario:${this.MAX_PER_USER}`);

    for (const it of items) {
      if (it.kind !== 'SEAT') continue;
      const exists = ev.seats.some(seat => seat.id === it.seatId);
      if (!exists) throw new BadRequestException(`SeatNotFound:${it.seatId}`);

      const key = store.seatKey(dto.eventId, it.seatId);
      const st = store.seatState.get(key) ?? 'FREE';
      if (st !== 'FREE') throw new BadRequestException(`Ticket No Disponible:${it.seatId}`);
    }

    for (const it of items) {
      if (it.kind !== 'GENERAL') continue;
      const key = store.genKey(dto.eventId, it.ticketTypeId);
      const avail = store.generalAvailable.get(key);
      if (avail === undefined) throw new BadRequestException(`TicketTypeNotGeneral:${it.ticketTypeId}`);
      if (it.qty <= 0) throw new BadRequestException('QtyInvalid');
      if (avail < it.qty) throw new BadRequestException(`NotEnoughCapacity:${it.ticketTypeId}`);
    }

    for (const it of items) {
      if (it.kind === 'SEAT') store.seatState.set(store.seatKey(dto.eventId, it.seatId), 'HELD');
      else store.generalAvailable.set(store.genKey(dto.eventId, it.ticketTypeId), store.generalAvailable.get(store.genKey(dto.eventId, it.ticketTypeId))! - it.qty);
    }

    const reservationId = randomUUID();
    const orderId = randomUUID();
    const expiresAt = Date.now() + dto.ttlMinutes * 60_000;

    store.reservations.set(reservationId, {
      id: reservationId,
      eventId: dto.eventId,
      userId: dto.userId,
      status: 'HOLD',
      expiresAt,
      items,
    });

    store.orders.set(orderId, {
      id: orderId,
      eventId: dto.eventId,
      userId: dto.userId,
      reservationId,
      status: 'PENDING_PAYMENT',
    });

    return { reservationId, orderId, expiresAt };
  }
}
