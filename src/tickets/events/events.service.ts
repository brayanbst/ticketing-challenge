import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateEventDto } from './dto/create-event.dto';
import { store, EventModel } from '../shared/inmem.store';

@Injectable()
export class EventsService {
  create(dto: CreateEventDto) {
    if (!dto?.id || !dto?.name || !Array.isArray(dto.ticketTypes)) {
      throw new BadRequestException('Invalid payload');
    }

    const seats: EventModel['seats'] = [];
    const ticketTypes: EventModel['ticketTypes'] = dto.ticketTypes.map((tt: any) => ({
      id: tt.id,
      name: tt.name,
      price: tt.price,
      capacity: typeof tt.capacity === 'number' ? tt.capacity : undefined,
    }));

    for (const tt of dto.ticketTypes as any[]) {
      if (Array.isArray(tt.seats)) {
        for (const s of tt.seats) {
          seats.push({ id: s.id, label: s.label, ticketTypeId: tt.id });
        }
      }
    }

    const ev: EventModel = { id: dto.id, name: dto.name, ticketTypes, seats };
    store.events.set(ev.id, ev);

    for (const s of ev.seats) store.seatState.set(store.seatKey(ev.id, s.id), 'FREE');
    for (const tt of ev.ticketTypes) {
      if (typeof tt.capacity === 'number') {
        store.generalAvailable.set(store.genKey(ev.id, tt.id), tt.capacity);
      }
    }

    return { eventId: ev.id };
  }

  get(eventId: string) {
    const ev = store.events.get(eventId);
    if (!ev) throw new BadRequestException('EventNotFound');
    return ev;
  }

  getInventoryView(eventId: string) {
    const ev = store.events.get(eventId);
    if (!ev) throw new BadRequestException('EventNotFound');

    const seatsByType = new Map<string, any[]>();
    for (const seat of ev.seats) {
      const st = store.seatState.get(store.seatKey(eventId, seat.id)) ?? 'FREE';
      const arr = seatsByType.get(seat.ticketTypeId) ?? [];
      arr.push({ seatId: seat.id, label: seat.label, state: st });
      seatsByType.set(seat.ticketTypeId, arr);
    }

    for (const [k, arr] of seatsByType.entries()) {
      arr.sort((a, b) => a.label.localeCompare(b.label));
      seatsByType.set(k, arr);
    }

    return {
      eventId,
      ticketTypes: ev.ticketTypes.map((tt) => {
        const seats = seatsByType.get(tt.id);
        if (seats?.length) {
          const capacityTotal = seats.length;
          const capacityFree = seats.filter((s) => s.state === 'FREE').length;
          return {
            ticketTypeId: tt.id,
            name: tt.name,
            mode: 'NUMBERED',
            price: tt.price,
            capacityTotal,
            capacityFree,
            seats,
          };
        }

        const capacityTotal = typeof tt.capacity === 'number' ? tt.capacity : 0;
        const capacityFree = store.generalAvailable.get(store.genKey(eventId, tt.id)) ?? capacityTotal;
        return {
          ticketTypeId: tt.id,
          name: tt.name,
          mode: 'GENERAL',
          price: tt.price,
          capacityTotal,
          capacityFree,
        };
      }),
    };
  }
}
