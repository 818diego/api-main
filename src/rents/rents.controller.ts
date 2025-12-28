import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RentsService } from './rents.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rents')
export class RentsController {
  constructor(private readonly rentsService: RentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createRentDto: CreateRentDto, @Request() req) {
    return this.rentsService.create(createRentDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.rentsService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.rentsService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRentDto: UpdateRentDto,
    @Request() req,
  ) {
    return this.rentsService.update(id, updateRentDto, req.user);
  }

  @Patch(':id/cliente-recoger')
  @UseGuards(JwtAuthGuard)
  async clienteRecoger(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.rentsService.clienteRecoger(id, req.user);
  }

  @Patch(':id/finalizar-tiempo')
  @UseGuards(JwtAuthGuard)
  async finalizarTiempo(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.rentsService.finalizarTiempo(id, req.user);
  }

  @Patch(':id/marcar-para-recoger')
  @UseGuards(JwtAuthGuard)
  async marcarParaRecoger(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.rentsService.marcarParaRecoger(id, req.user);
  }

  @Patch(':id/finalizar')
  @UseGuards(JwtAuthGuard)
  async finalizarRenta(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.rentsService.finalizarRenta(id, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.rentsService.remove(id, req.user);
  }
}

