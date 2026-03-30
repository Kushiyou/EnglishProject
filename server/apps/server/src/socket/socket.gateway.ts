import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
    cors:{
      origin:'*',
    }
  })
export class SocketGateway {

  @WebSocketServer()
  server!: Server;

  //socket链接成功触发，生命周期其一
  handleConnection(client: Socket){
    const userId = client.handshake.query.userId //前端链接的传入的
    if(userId){
      client.join(`user_${userId}`) //加入房间
    }
  }

  //支付成功通知前端关闭弹框的
  emitPaymentSuccess(userId:string){
    //通知房间的用户`user_${userId}`
    this.server.to(`user_${userId}`).emit("paymentSuccess",userId)
  }
}
