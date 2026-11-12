import { Controller, Get, Patch, Post, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔥 THIS IS THE FIX FOR THE DROPDOWN
  @Get()
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get('profile')
  getProfile(@Query('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Get('dashboard-stats')
  getDashboardStats(@Query('userId') userId: string) {
    return this.usersService.getDashboardStats(userId);
  }

  @Post('create-profile')
  createProfile(@Body('userId') userId: string) {
    return this.usersService.createProfileIfMissing(userId);
  }

  @Patch('profile')
  updateProfile(@Body() body: any) {
    return this.usersService.updateProfile(body.userId, body);
  }
}