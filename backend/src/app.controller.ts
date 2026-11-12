import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'MediCare Backend is running successfully! 🚀';
  }
}