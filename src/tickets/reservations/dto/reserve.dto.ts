export class ReserveDto {
  eventId: string;
  userId: string;
  ttlMinutes: number;
  seats?: string[];
  general?: { ticketTypeId: string; qty: number }[];
}
