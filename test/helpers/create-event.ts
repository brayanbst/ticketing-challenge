import { EventsService } from '../../src/tickets/events/events.service';

export async function createBaseEvent(events: EventsService) {
  return events.create({
    id: 'ev1',
    name: 'Concierto Bad Bunny',
    ticketTypes: [
      {
        id: 'vip',
        name: 'VIP NUMERADO',
        price: 350,
        seats: [
          { id: 's1', label: 'A-12' },
          { id: 's2', label: 'A-13' },
        ],
      },
      {
        id: 'gen',
        name: 'GENERAL (SIN ASIENTO)',
        price: 120,
        capacity: 5,
      },
    ],
  } as any);
}
