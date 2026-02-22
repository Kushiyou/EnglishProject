export interface User {
    id: string; // 用户ID
    name: string; // 用户名
    email?: string | null; // 邮箱
    phone: string; // 手机号
    address?: string | null; // 地址
    password: string; // 密码
    avatar?: string | null; // 头像
    bio?: string | null; // 签名  
    isTimingTask: boolean; // 是否开启定时任务 
    timingTaskTime: string; // 定时任务时间 
    wordNumber: number; // 单词数量
    dayNumber: number; // 打卡天数
    createdAt: Date; // 创建时间
    updatedAt: Date; // 更新时间
    lastLoginAt?: Date | null; // 最后登录时间
}

// 用户登录和注册类型 Pick和 Omit 用于从 User 类型中选择或排除特定字段，定义了用户登录、注册和返回的类型结构。
export type UserLogin = Pick<User, 'phone' | 'password'>
export type UserRegister = Pick<User, 'name' | 'phone' | 'email' | 'password'>
//返回的类型,不包含密码
export type ResultUser = Omit<User, 'password'>
//更新用户的类型
export type UserUpdate = Pick<User, 'name' | 'email' | 'address' | 'avatar' | 'bio' | 'isTimingTask' | 'timingTaskTime'>
//头像返回的类型
export type AvatarResult = {
    previewUrl: string; // 预览URL
    databaseUrl: string; // 数据库URL
}
//token的类型
export type Token = {
    accessToken: string // 访问令牌
    refreshToken: string // 刷新令牌
}
//返回的类型,包含token
export type WebResultUser = ResultUser & {
    token: Token
}
// token的payload类型，包含用户ID和令牌类型
export type TokePlayload = Pick<User, 'name' | 'email'> & {
    userId: User["id"] // 用户ID
}
//refreshToken的payload类型，包含用户ID和令牌类型
export type RefreshTokenPlayload = TokePlayload & {
    tokenType:'refresh' | 'access' // 令牌类型为refresh还是access
}