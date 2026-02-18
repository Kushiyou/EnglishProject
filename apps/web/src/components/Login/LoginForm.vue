<template>
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
        <p class="text-gray-500 text-sm">请登录您的账户以继续</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" class="space-y-6">
        <el-form-item prop="phone">
            <el-input maxlength="11" v-model="form.phone" placeholder="请输入手机号" size="large" class="h-12" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" class="h-12"
                :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item class="pt-4">
            <el-button type="primary" size="large"
                class="w-full h-12 text-base font-semibold bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0"
                @click="handleLogin">
                登录
            </el-button>
        </el-form-item>
    </el-form>
</template>


<script setup lang="ts">
import { ref, toRaw, useTemplateRef } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/apis/user'
import type { UserLogin } from '@en/common/user'
import md5 from 'md5'
import { ElMessage } from 'element-plus'
import { useLogin } from '@/hooks/useLogin'
import { useUserStore } from '@/stores/user'
import { f } from 'vue-router/dist/router-CWoNjPRp.mjs'
const userStore = useUserStore()
const { hide } = useLogin()
const formRef = useTemplateRef('formRef')
const form = ref<UserLogin>({
    phone: '',
    password: '',
})

const rules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
}

const handleLogin = async () => {
    //验证表单
    await formRef.value?.validate()
    try{
        const loginData = toRaw(form.value) //获取原始数据对象，避免Vue的响应式系统对数据进行代理
        loginData.password = md5(loginData.password) //对密码进行MD5加密
        const res = await login(loginData)
        if (res.code === 200) {
            //将数据存入pinia
            userStore.setUser(res.data)
            console.log('localStorage user:', userStore.getUser)
            hide() //隐藏登录注册组件
        } else {
            ElMessage.error('登录失败:' + (res.code || '未知错误'))
        }
    }finally{
        //hide() //隐藏登录注册组件
    }
}
</script>