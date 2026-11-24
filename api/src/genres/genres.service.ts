import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.genre.findMany();
  }

  async createGenre(dto: { name: string; slug: string }) {
    try {
      return await this.prisma.genre.create({
        data: {
          name: dto.name,
          slug: dto.slug,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Genre with this name or slug already exists',
        );
      }
      throw error;
    }
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.genre.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Turns a Prisma error into the right HTTP exception.
  // Codes: P2002 = unique taken, P2025 = row not found.
  // A RESTRICT violation arrives unlabelled (no code), so it is matched by message text.
  private handlePrismaError(error: unknown, id: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Genre with this name or slug already exists',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Genre with ID ${id} not found`);
      }
    }
    // Handle the case where a RESTRICT violation occurs, which is not labeled with a specific Prisma error code.
    if (
      error instanceof Prisma.PrismaClientUnknownRequestError &&
      error.message.includes(
        'violates RESTRICT setting of foreign key constraint',
      )
    ) {
      throw new ConflictException(
        `Genre with ID ${id} still has books associated with it and cannot be deleted`,
      );
    }
    // If the error is not one of the known Prisma errors, rethrow it to be handled by NestJS's global exception filter.
    throw error;
  }
}
