import { useUserStore } from '@/stores/user'
import { IS_SHOW_LOGIN } from '../components/Login/type'// 引入登录框显示状态的唯一标识符
import { inject, ref } from 'vue'
import router from '@/router'

export function useLogin() {
    const isShowLogin = inject(IS_SHOW_LOGIN, ref(false)) // 注入登录框显示状态
    
        const userStore = useUserStore() // 获取用户状态
    const login = () => {
        return new Promise((resolve,reject) => {
            if(userStore.getUser){
                resolve(true) //用户已登录
            }else{
                isShowLogin.value = true //显示登录弹窗
                reject(false)
            }
        })
    }
    const logout = () => {
        userStore.logout() // 执行登出操作，清除用户信息
        router.replace('/') // 跳转到首页
    }
    const hide = () => {
        isShowLogin.value = false // 隐藏登录框
    }
    return {
        login,
        hide,
        logout
    }
}