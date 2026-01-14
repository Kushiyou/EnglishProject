import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
    success(data:number|string|object,code=200){
        return{
            data,
            code
        }
    }
    error(code){
        return{
            code
        }
    }
}
