import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenPlayload } from '@en/common/user';
//这是一个简单的AuthGuard，暂时没有实现具体的认证逻辑，后续可以根据需要添加具体的认证逻辑，比如验证JWT token等
// web -> axios -> 请求 -> guard -> controller -> service -> prisma -> response
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //1.读取req
    const request = context.switchToHttp().getRequest();
    //2.读取请求头
    const headers = request.headers;
    //3.从请求头中获取token
    if (!headers.authorization) {
      //如果请求头中没有authorization字段，则返回false，表示认证失败
      throw new UnauthorizedException('没有authorization字段');//401 未授权
    }
    const token = headers.authorization.split(' ')[1];
    //4.验证token是否有效，如果无效则返回false，表示认证失败
    try {
      const decoded = this.jwtService.verify<RefreshTokenPlayload>(token);
      if (decoded.tokenType !== 'access') {
        //如果token类型不是accessToken，则返回false，表示认证失败
        //为什么要区分accessToken和refreshToken呢？因为accessToken是用来访问受保护的资源的，而refreshToken是用来刷新accessToken的，如果使用refreshToken来访问受保护的资源，那么就会存在安全隐患，因为refreshToken的过期时间比较长，如果被泄露了，那么攻击者就可以一直使用这个refreshToken来获取新的accessToken，从而访问受保护的资源，所以我们需要区分accessToken和refreshToken，只有accessToken才能访问受保护的资源，refreshToken只能用来刷新accessToken
        throw new UnauthorizedException('token类型错误');
      }
      //将解密后的用户信息挂载到请求对象上，这样后续的controller和service就可以通过request.user来获取用户信息了
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('token无效或过期');
    }
  }
}
