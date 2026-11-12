import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HealthRecordsService } from './health-records.service';

@Controller('health-records')
export class HealthRecordsController {
  constructor(private readonly recordsService: HealthRecordsService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.recordsService.findPatientRecords(userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.recordsService.createRecord(body);
  }
}