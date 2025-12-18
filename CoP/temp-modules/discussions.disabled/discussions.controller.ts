import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DiscussionsService } from './discussions.service';
import { CreateThreadDto, CreateReplyDto } from './dto';

/**
 * Discussions Controller
 * 
 * Endpoints:
 * - GET /cops/:copId/discussions - List threads for CoP
 * - POST /cops/:copId/discussions - Create thread
 * - GET /discussions/:threadId - Get thread with replies
 * - POST /discussions/:threadId/replies - Add reply
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get('cops/:copId/discussions')
  findByCop(@Param('copId') copId: string, @Req() req: any) {
    return this.discussionsService.findByCop(copId, req.user);
  }

  @Post('cops/:copId/discussions')
  createThread(
    @Param('copId') copId: string,
    @Body() dto: CreateThreadDto,
    @Req() req: any,
  ) {
    return this.discussionsService.createThread(copId, dto, req.user);
  }

  @Get('discussions/:threadId')
  findOne(@Param('threadId') threadId: string, @Req() req: any) {
    return this.discussionsService.findOne(threadId, req.user);
  }

  @Post('discussions/:threadId/replies')
  createReply(
    @Param('threadId') threadId: string,
    @Body() dto: CreateReplyDto,
    @Req() req: any,
  ) {
    return this.discussionsService.createReply(threadId, dto, req.user);
  }
}

