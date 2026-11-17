import { Body, Controller, Get, Post } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';

@Controller('genres')
export class GenresController {
  constructor(private readonly genreService: GenresService) {}

  @Get()
  findAll() {
    return this.genreService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGenreDto) {
    return this.genreService.createGenre(dto);
  }
}
