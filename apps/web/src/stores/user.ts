import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WebResultUser, Token, UserUpdate } from '@en/common/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<WebResultUser | null>(null)
  const setUser = (params: WebResultUser) => {
    user.value = params
  }
  const getUser = computed(() => user.value)
  //导出accessToken
  const getAccessToken = computed(() => user.value?.token.accessToken)
  //导出refreshToken
  const getRefreshToken = computed(() => user.value?.token.refreshToken)
  //设置页面获取的默认用户信息
  const getUserInfo = computed<UserUpdate>(() => {
    return {
      name: user.value!.name,
      email: user.value!.email,
      address: user.value!.address,
      avatar: user.value!.avatar,
      bio: user.value!.bio,
      isTimingTask: user.value!.isTimingTask,
      timingTaskTime: user.value!.timingTaskTime,
    }
  })
  //刷新token
  const updateToken = (newToken: Token) => {
    user.value!.token = newToken
  }
  //设置页面更新的用户信息
  const updateUser = (params: UserUpdate) => {
    user.value!.name = params.name
    user.value!.email = params.email
    user.value!.address = params.address
    user.value!.avatar = params.avatar
    user.value!.bio = params.bio
    user.value!.isTimingTask = params.isTimingTask
    user.value!.timingTaskTime = params.timingTaskTime
  }

  const logout = () => {
    user.value = null
  }

  return { user, setUser, getUser, logout, getAccessToken, getRefreshToken, updateToken, updateUser, getUserInfo }
}, {
  persist: true, //启用持久化，将用户信息保存在localStorage中，刷新页面后仍然保持登录状态
})
