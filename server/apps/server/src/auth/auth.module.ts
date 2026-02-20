import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
//引入shareModule
import { SharedModule } from '@libs/shared';

@Module({
    imports: [SharedModule],//引入SharedModule，这样就能在AuthService中注入SharedService了
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}
