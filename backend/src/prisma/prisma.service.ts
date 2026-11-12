import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Create the PostgreSQL pool
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });
    
    // 2. Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to PrismaClient (Required in v7)
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}