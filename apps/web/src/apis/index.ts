import axios from 'axios'

const timeout = 50000; // 设置请求超时时间为50秒
export const serverApi = axios.create({
  baseURL: '/api/v1', // 设置基础URL，所有请求都会以这个URL为前缀
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})
serverApi.interceptors.response.use(
  response => response.data, // 直接返回响应数据
)


export const serverAi = axios.create({
  baseURL: '/api/ai/v1', // 设置基础URL，所有请求都会以这个URL为前缀
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})
serverAi.interceptors.response.use(
  response => response.data, // 直接返回响应数据
)

// 定义响应数据的接口
export interface Respone<T=any> {
  timestamp: string; // 响应时间戳，ISO 格式字符串,
  path: string; // 请求路径,
  message: string; // 响应消息,
  code: number; // 响应状态码,
  success: boolean; // 是否成功,
  data: T ; // 响应数据
}