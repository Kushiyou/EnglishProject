import { Body, Injectable } from '@nestjs/common';
import type { CreatePayDto } from '@en/common/pay';
import type { TokePlayload } from '@en/common/user';
import { PrismaService, PayService as SharePayService, ResponseService } from '@libs/shared';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import * as nanoid from 'nanoid';
import type { Request } from 'express';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
//引入socket.getway
import { SocketGateway } from '../socket/socket.gateway'

@Injectable()
export class PayService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharePayService: SharePayService,
    private readonly configService: ConfigService,
    private readonly responseService: ResponseService,
    private readonly socketGateway: SocketGateway
  ) { }

  private createTreaNo() {
    const prifix = "Killer"
    return `${prifix}-${nanoid.nanoid(12)}`
  }

  async create(createPayDto: CreatePayDto, user: TokePlayload) {
    //购买过课程不能重复购买
    const courseRecord = await this.prismaService.courseRecord.findFirst({
      where: {
        userId: user.userId,
        courseId: createPayDto.courseId,
      },
    })
    if (courseRecord) {
      return this.responseService.error(null, '您已经购买过该课程',);
    }

    //使用prisma事物，因为创建订单表和支付宝那边的同成功同失败的
    const result = await this.prismaService.$transaction(async (tx) => {
      //1.进到这里说名用户是登录的且token有效，在这里创建一个订单表
      const outTradeNo = this.createTreaNo();
      await tx.paymentRecord.create({
        data: {
          userId: user.userId,
          outTradeNo: outTradeNo,
          amount: createPayDto.total_amount,
          subject: createPayDto.subject,
          body: createPayDto.body
        }
      })
      //2.支付宝SDK生成订单返回支付地址
      const dateTime = dayjs().add(1, 'minute') //1分钟
      const payUrl = this.sharePayService.getAlipaySdk().pageExecute('alipay.trade.page.pay', 'GET', {
        bizContent: {
          out_trade_no: outTradeNo, //订单编号
          product_code: "FAST_INSTANT_TRADE_PAY",
          subject: createPayDto.subject, //支付主题
          body: JSON.stringify({ //因为创建课程的时候我们需要课程id和用户id入库
            courseId: createPayDto.courseId,
            userId: user.userId
          }), //支付内容
          total_amount: createPayDto.total_amount, //支付金额
          time_expire: dateTime.format('YYYY-MM-DD HH:mm:ss'), //过期时间  绝对时间
        },
        notify_url: `${this.configService.get<string>('ALIPAY_NOTIFY_URL')!}/api/v1/pay/notify`,
      });
      return {
        payUrl, //返回支付宝的支付链接
        timeExpire: dateTime.toDate().getTime() //时间戳
      }
    })
    return this.responseService.success(result);
  }


  async notify(req: Request) {
    this.prismaService.$transaction(async (tx) => {
      //1. 更新库
      const paymentRecord = await tx.paymentRecord.update({
        where: {
          outTradeNo: req.body.out_trade_no//re是支付宝返回来的回调信息，里面有订单编号的
        },
        data: {
          tradeNo: req.body.trade_no, //这个是支付宝交易号
          tradeStatus: TradeStatus.TRADE_SUCCESS, //支付状态
          sendPayTime: dayjs(req.body.gmt_payment).toDate() //支付时间
        }
      })
      //2. 创建课程：把课程写入表中看谁拥有这个课程
      //拿到用户id和课程id
      const { courseId, userId } = JSON.parse(req.body.body)
      await tx.courseRecord.create({
        data: {
          userId: userId,
          courseId: courseId,
          isPurchased: true,
          paymentRecordId: paymentRecord.id
        }
      })
      //socket 通知前端支付成功
      this.socketGateway.emitPaymentSuccess(userId)
    })
    /* 
    {
      gmt_create: '2026-03-23 22:12:05',
      charset: 'utf-8',
      gmt_payment: '2026-03-23 22:12:15',
      notify_time: '2026-03-23 22:12:16',
      subject: '中考单词',
      sign: 'UmreyzL94J2n+BXv6qHs4O97ehWeZvyCQR2ePDHAQ03i6Fh9y5IEbT+KsOf2TR2L8mRSU05TkPxUs8ihIp2clZMUCoFadCvLdJeQ7LqYtv6UIa2hsJy/CAXM34hMuYEiAhHmN5Si4TVnUnyKtpoDBbJLUEMBVlnWSt84Y+inslDHqUyOMidtt9V98QzAhYdTns4r4RxUJMAfwsOsZbNSWhILip7Z0fYEYYSuvSbD9YQS9RnnOXdVRTvj7CayhzbEhpj0JGCbACkAxi9dtQQNVQEHzqU8cU/1T4U0WZyDVTacB0KDAEFRuFNPy2grPDCEspsc4li+8/shRSMujMdm9Q==',
      buyer_id: '2088722098089913',
      body: '紧扣中考考纲，初中三年词汇一站式掌握，打好英语基础。',
      invoice_amount: '35.00',
      version: '1.0',
      notify_id: '2026032301222221216189910508162433',
      fund_bill_list: '[{"amount":"35.00","fundChannel":"ALIPAYACCOUNT"}]',
      notify_type: 'trade_status_sync',
      out_trade_no: 'Killer-IFcaqb88LPC8',
      total_amount: '35.00',
      trade_status: 'TRADE_SUCCESS',
      trade_no: '2026032322001489910508253278',
      auth_app_id: '9021000162607382',
      receipt_amount: '35.00',
      point_amount: '0.00',
      buyer_pay_amount: '35.00',
      app_id: '9021000162607382',
      sign_type: 'RSA2',
      seller_id: '2088721098120934'
    } */
    return true
  }
}
