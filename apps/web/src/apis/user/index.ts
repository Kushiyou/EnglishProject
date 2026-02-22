import { serverApi, type Respone } from ".."
import type { UserLogin, UserRegister, WebResultUser, AvatarResult, UserUpdate } from "@en/common/user"

//用户登录的API函数，接受一个UserLogin类型的参数，并返回一个包含WebResultUser数据的Promise对象
export const login = (data: UserLogin): Promise<Respone<WebResultUser>> => {
    return serverApi.post('/user/login', data) as Promise<Respone<WebResultUser>>;
}

//用户注册的API函数，接受一个UserRegister类型的参数，并返回一个包含WebResultUser数据的Promise对象
export const register = (data: UserRegister): Promise<Respone<WebResultUser>> => {
    return serverApi.post('/user/register', data) as Promise<Respone<WebResultUser>>;
}

//上传头像
export const uploadAvatar = (flie:FormData)=>{
    return serverApi.post('/user/upload-avatar', flie) as Promise<Respone<AvatarResult>>;
}  

//更新用户信息
export const updateUser = (data: UserUpdate) => serverApi.post('/user/update-user', data) as Promise<Respone<UserUpdate>>;
