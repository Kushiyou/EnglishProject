import { IS_SHOW_LOGIN } from '../components/Login/type'// 引入登录框显示状态的唯一标识符
import { inject, ref } from 'vue'

export function useLogin() {
    const isShowLogin = inject(IS_SHOW_LOGIN, ref(false)) // 注入登录框显示状态
    const login = () => {
        isShowLogin.value = true // 显示登录框
    }
    const logout = () => {
        isShowLogin.value = false // 隐藏登录框
    }
    return {
        login,
        logout
    }
}