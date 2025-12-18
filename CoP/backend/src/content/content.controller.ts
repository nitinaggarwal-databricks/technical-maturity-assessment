import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { CurrentUserId } from '../common/user.decorator';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(@Body() dto: CreateContentDto, @CurrentUserId() userId: string | null) {
    return this.contentService.create({
      ...dto,
      createdById: dto.createdById ?? userId ?? undefined,
    });
  }

  @Get('cop/:copId')
  listByCop(@Param('copId') copId: string) {
    return this.contentService.listByCop(copId);
  }

  @Post(':assetId/engagement/:userId/:type')
  recordEngagement(
    @Param('assetId') assetId: string,
    @Param('userId') userId: string,
    @Param('type') type: string,
  ) {
    return this.contentService.recordEngagement(assetId, userId, type);
  }
}

