import { RefreshTokenPlayload, Token, TokePlayload } from '@en/common/user';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }
    generateToken(playload: TokePlayload): Token {
        //sign方法生成JWT，传入playload和密钥，返回一个字符串，这个字符串就是JWT
        return {
            //生成accessToken，过期时间为10秒
            accessToken: this.jwtService.sign<RefreshTokenPlayload>({...playload,tokenType:'access'}),
            //生成refreshToken，过期时间为7天
            refreshToken:this.jwtService.sign<RefreshTokenPlayload>({...playload,tokenType:'refresh'},{expiresIn:'7d'}),
        }
    }
}
