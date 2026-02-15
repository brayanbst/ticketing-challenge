import { Body, Controller, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReserveDto } from './dto/reserve.dto';

@Controller()
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @Post('/reservations')
  reserve(@Body() dto: ReserveDto) {
    return this.reservations.reserve(dto);
  }
}
