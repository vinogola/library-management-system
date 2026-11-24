import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({
        data: {
          ...dto,
          // Prisma wants a full DateTime; the DTO only guarantees a date string.
          publicationDate: dto.publicationDate
            ? new Date(dto.publicationDate)
            : undefined,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Turns a Prisma error into the right HTTP exception.
  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A book with this ISBN already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('The specified genre does not exist');
      }
    }
    throw error;
  }
}
