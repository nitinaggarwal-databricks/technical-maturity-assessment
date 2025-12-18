import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Create event
  @Post('events')
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  // Get events by CoP (alternate route for backwards compatibility)
  @Get('events/cop/:copId')
  findByCopAlt(@Param('copId') copId: string) {
    return this.eventsService.findByCop(copId);
  }

  // Get events by CoP (REST-ful route)
  @Get('cops/:copId/events')
  findByCop(@Param('copId') copId: string) {
    return this.eventsService.findByCop(copId);
  }
}

