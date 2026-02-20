import axios from 'axios'
//引入userStore，这样我们就可以在请求拦截器中获取到用户的token了
import { useUserStore } from '@/stores/user'
import router from '@/router';
import { refreshTokenApi } from './auth';
import type { st } from 'vue-router/dist/router-CWoNjPRp.mjs';


const timeout = 50000; // 设置请求超时时间为50秒
let isRefreshing = false; // 是否正在刷新token
let requestQueue: ((token: string) => void)[] = []; // 刷新token的订阅者列表

//serverApi用于访问后端API，serverAi用于访问AI相关的API，这样可以根据不同的需求进行请求分离和管理
export const serverApi = axios.create({
  baseURL: '/api/v1', // 设置基础URL，所有请求都会以这个URL为前缀
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})
//在请求拦截器中添加Authorization字段，这样后端就能通过这个字段来验证用户的身份了
serverApi.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    //在请求头中添加Authorization字段，值为Bearer token，这样后端就能通过这个字段来验证用户的身份了
    const token = userStore.getAccessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;

  }
)
//响应拦截器，如果响应状态码是401，表示token无效或过期，需要刷新token
serverApi.interceptors.response.use(
  response => response.data, // 直接返回响应数据
  async error => {
    if (error.response && error.response.status !== 401) {
      return Promise.reject(error.response);
    }
    //处理401的情况，这里可以调用刷新token的接口，获取新的accessToken和refreshToken
    const userStore = useUserStore();
    const refreshToken = userStore.getRefreshToken;
    const accessToken = userStore.getAccessToken;
    if (!refreshToken || !accessToken) {
      //如果没有refreshToken或者accessToken，表示用户没有登录或者登录状态已经过期，需要用户重新登录
      userStore.logout();//清除用户信息
      router.replace('/login'); // 跳转到登录页
      return Promise.reject(error);
    }
    if (isRefreshing) {
      //如果正在刷新token，表示已经有一个请求在刷新token了，那么我们就把当前的请求加入到订阅者列表中，当token刷新成功后，再重新发送这些请求
      return new Promise((resolve) => {
        requestQueue.push((newAccessToken: string) => {
          error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          resolve(serverApi(error.config));
        });
      });

    } //刷新token
    isRefreshing = true
    try {
      const newToken = await refreshTokenApi({ refreshToken: refreshToken as string });
      if (newToken.success) {
        //切换成功更新token到pinia中
        userStore.updateToken(newToken.data)
      } else {
        userStore.logout() //清空user
        router.replace('/') //跳转到首页
        return Promise.reject(error)
      }
      const newAccessToken = newToken.data.accessToken
      requestQueue.forEach(callback => callback(newAccessToken)) //执行存储的请求
      return serverApi(error.config) //重新发送原来的请求
    } catch (error) {
      return Promise.reject(error)
    } finally {
      requestQueue = [] //清空队列
      isRefreshing = false //重置刷新状态
    }
  }
)

//serverAi用于访问AI相关的API，这样可以根据不同的需求进行请求分离和管理
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
export interface Respone<T = any> {
  timestamp: string; // 响应时间戳，ISO 格式字符串,
  path: string; // 请求路径,
  message: string; // 响应消息,
  code: number; // 响应状态码,
  success: boolean; // 是否成功,
  data: T; // 响应数据
}