import axios from "axios";
import type { Token } from "@en/common/user";
import type { Respone } from "..";

const refreshApi = axios.create({
    baseURL: '/api/v1', // 设置基础URL，所有请求都会以这个URL为前缀
    timeout: 50000, // 设置请求超时时间为5秒
    headers: {
        'Content-Type': 'application/json',
    },
})

//响应拦截器
refreshApi.interceptors.response.use(
    (response) => {
        return response.data; // 直接返回响应数据
    },
    (error) => {
        // //如果响应状态码是401，表示token无效或过期，需要刷新token
        // if (error.response && error.response.status === 401) {
        //     //这里可以调用刷新token的接口，获取新的accessToken和refreshToken
        //     //假设刷新token的接口是/api/v1/auth/refresh，传入refreshToken，返回新的accessToken和refreshToken
        //     const refreshToken = localStorage.getItem('refreshToken');
        //     return axios.post('/api/v1/auth/refresh', { refreshToken })

        //         .then((res) => {
        //             const { accessToken, refreshToken } = res.data.data;
        //             //将新的accessToken和refreshToken保存到localStorage中
        //             localStorage.setItem('accessToken', accessToken);
        //             localStorage.setItem('refreshToken', refreshToken);
        //             //将新的accessToken添加到原来的请求头中，重新发送原来的请求
        //             error.config.headers['Authorization'] = `Bearer ${accessToken}`;
        //             return axios(error.config);
        //         }
        //         )
        //         .catch((err) => {
        //             //如果刷新token失败，表示refreshToken无效或过期，需要用户重新登录
        //             localStorage.removeItem('accessToken');
        //             localStorage.removeItem('refreshToken');
        //             window.location.href = '/login'; // 跳转到登录页
        //             return Promise.reject(err);
        //         });
        // }
        return Promise.reject(error);
    }
)

export const refreshTokenApi = (data:Omit<Token,'accessToken'>) => {
    return refreshApi.post('/user/refresh-token', data) as Promise<Respone<Token>> ;
}