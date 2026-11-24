import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [BooksController],
  imports: [PrismaModule],
  providers: [BooksService],
})
export class BooksModule {}
