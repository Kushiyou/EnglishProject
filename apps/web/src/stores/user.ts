import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WebResultUser, Token } from '@en/common/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<WebResultUser | null>(null)
  const setUser = (params:WebResultUser)=>{
    user.value = params
  }
  const getUser = computed(() => user.value)
  //导出accessToken
  const getAccessToken = computed(() => user.value?.token.accessToken)
  //导出refreshToken
  const getRefreshToken = computed(() => user.value?.token.refreshToken)
  //刷新token
  const updateToken = (newToken:Token) => {
    user.value!.token = newToken
  }

  const logout = () => {
    user.value = null
  }

  return { user, setUser, getUser, logout, getAccessToken, getRefreshToken, updateToken}
},{
  persist: true, //启用持久化，将用户信息保存在localStorage中，刷新页面后仍然保持登录状态
})
