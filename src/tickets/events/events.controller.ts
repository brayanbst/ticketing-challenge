import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post('/events')
  create(@Body() dto: CreateEventDto) {
    return this.events.create(dto);
  }

  @Get('/events/:eventId')
  get(@Param('eventId') eventId: string) {
    return this.events.get(eventId);
  }

  @Get('/events/:eventId/inventory')
  inventory(@Param('eventId') eventId: string) {
    return this.events.getInventoryView(eventId);
  }
}
