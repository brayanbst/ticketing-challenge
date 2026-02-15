export class CreateEventDto {
  id: string;
  name: string;
  ticketTypes: Array<
    | {
        id: string;
        name: string;
        price: number;
        seats: { id: string; label: string }[];
      }
    | {
        id: string;
        name: string;
        price: number;
        capacity: number;
      }
  >;
}
