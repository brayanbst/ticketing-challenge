import { Injectable } from '@nestjs/common';
import { store } from '../shared/inmem.store';

@Injectable()
export class JobsService {
  releaseExpired() {
    const now = Date.now();
    let released = 0;

    for (const r of store.reservations.values()) {
      if (r.status !== 'HOLD') continue;
      if (r.expiresAt > now) continue;

      r.status = 'EXPIRED';
      released++;

      for (const it of r.items) {
        if (it.kind === 'SEAT') {
          const key = store.seatKey(r.eventId, it.seatId);
          if (store.seatState.get(key) === 'HELD') store.seatState.set(key, 'FREE');
        } else {
          const key = store.genKey(r.eventId, it.ticketTypeId);
          store.generalAvailable.set(key, (store.generalAvailable.get(key) ?? 0) + it.qty);
        }
      }
    }

    return { released };
  }
}
