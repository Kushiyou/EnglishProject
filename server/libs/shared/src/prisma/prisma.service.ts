import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
    getPrismaInfo(): string {
        return 'Prisma Service is working!5555';
    }
}
