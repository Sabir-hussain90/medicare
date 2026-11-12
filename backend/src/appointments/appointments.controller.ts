import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  @Get()
  findAll(@Query('userId') userId: string, @Query('role') role: string) {
    return this.appointmentsService.findUserAppointments(userId, role);
  }
}