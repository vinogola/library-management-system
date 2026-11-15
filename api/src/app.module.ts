import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenresModule } from './genres/genres.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [GenresModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
