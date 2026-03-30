import { Controller, Post, Body,  UseGuards, Req, All} from '@nestjs/common';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import { PayService } from './pay.service';
import type { CreatePayDto } from '@en/common/pay';
import type { Request } from 'express';


@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() createPayDto: CreatePayDto, @Req() req: Request) {
    const user = req.user
    return this.payService.create(createPayDto, user);
  }

  //这个接口是给支付宝调用的
  @All('notify')
  notify(@Req() req: Request) {
    return this.payService.notify(req);
  }
}
