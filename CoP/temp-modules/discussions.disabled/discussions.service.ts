import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantGuard } from '../auth/tenant.guard';
import { CreateThreadDto, CreateReplyDto } from './dto';

@Injectable()
export class DiscussionsService {
  constructor(
    private prisma: PrismaService,
    private tenantGuard: TenantGuard,
  ) {}

  async findByCop(copId: string, user: any) {
    const cop = await this.prisma.cop.findUnique({
      where: { id: copId },
      select: { customerId: true },
    });
    if (!cop) throw new NotFoundException('CoP not found');

    // Multi-tenant check
    this.tenantGuard.enforceCustomerAccess(user, cop.customerId);

    return this.prisma.discussionThread.findMany({
      where: { copId },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createThread(copId: string, dto: CreateThreadDto, user: any) {
    const cop = await this.prisma.cop.findUnique({
      where: { id: copId },
      select: { customerId: true },
    });
    if (!cop) throw new NotFoundException('CoP not found');

    this.tenantGuard.enforceCustomerAccess(user, cop.customerId);

    return this.prisma.discussionThread.create({
      data: {
        copId,
        title: dto.title,
        body: dto.body,
        createdById: user.sub,
      },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findOne(threadId: string, user: any) {
    const thread = await this.prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        cop: { select: { customerId: true } },
        creator: { select: { id: true, fullName: true, email: true } },
        replies: {
          include: {
            creator: { select: { id: true, fullName: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    this.tenantGuard.enforceCustomerAccess(user, thread.cop.customerId);

    // Increment view count
    await this.prisma.discussionThread.update({
      where: { id: threadId },
      data: { viewCount: { increment: 1 } },
    });

    return thread;
  }

  async createReply(threadId: string, dto: CreateReplyDto, user: any) {
    const thread = await this.prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: { cop: { select: { customerId: true } } },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    this.tenantGuard.enforceCustomerAccess(user, thread.cop.customerId);

    return this.prisma.discussionReply.create({
      data: {
        threadId,
        body: dto.body,
        createdById: user.sub,
      },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}

