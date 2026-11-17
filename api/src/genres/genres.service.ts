import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
}
