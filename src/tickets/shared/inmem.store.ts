export type SeatState = 'FREE' | 'HELD' | 'SOLD';

export type TicketTypeInput =
  | { id: string; name: string; price: number; seats: { id: string; label: string }[] }
  | { id: string; name: string; price: number; capacity: number };

export type EventModel = {
  id: string;
  name: string;
  ticketTypes: {
    id: string;
    name: string;
    price: number;
    capacity?: number;
  }[];
  seats: { id: string; label: string; ticketTypeId: string }[];
};

export type ReservationItem =
  | { kind: 'SEAT'; seatId: string }
  | { kind: 'GENERAL'; ticketTypeId: string; qty: number };

export type ReservationModel = {
  id: string;
  eventId: string;
  userId: string;
  status: 'HOLD' | 'EXPIRED' | 'CONFIRMED';
  expiresAt: number;
  items: ReservationItem[];
};

export type OrderModel = {
  id: string;
  eventId: string;
  userId: string;
  reservationId: string;
  status: 'PENDING_PAYMENT' | 'PAID';
};

export class InMemStore {
  events = new Map<string, EventModel>();

  seatState = new Map<string, SeatState>();
  generalAvailable = new Map<string, number>();

  reservations = new Map<string, ReservationModel>();
  orders = new Map<string, OrderModel>();
  paymentProviderIds = new Set<string>();

  seatKey(eventId: string, seatId: string) {
    return `${eventId}:${seatId}`;
  }
  genKey(eventId: string, ticketTypeId: string) {
    return `${eventId}:${ticketTypeId}`;
  }
}

export const store = new InMemStore();
