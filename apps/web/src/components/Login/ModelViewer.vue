<template>
    <div class="relative w-[800px] h-full bg-linear-to-br from-gray-800 to-gray-900">
        <canvas class="w-full h-full" ref="canvasRef"></canvas>
        <div class="absolute top-6 left-6">
            <div class="flex items-center gap-2">
                <div
                    class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-[10px] flex items-center justify-center">
                    <span class="text-white font-bold text-xl">E</span>
                </div>
                <span class="text-white text-xl font-bold">English App</span>
            </div>
        </div>
        <!-- 登录/注册切换按钮 -->
        <div class="absolute top-6 right-6">
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button @click="loadModel('login')" :class="loginClass">
                    登录
                </button>
                <button @click="loadModel('register')" :class="registerClass">
                    注册
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'// 引入 GLTFLoader 轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//引入 GLTFLoader 模型加载器
import type { LoginType } from './type'
const canvasRef = useTemplateRef('canvasRef')// 获取 canvas 元素的引用
const type = ref<LoginType>('login')
const emits = defineEmits(['changeType'])
const loginClass = computed(() => {
    return type.value === 'login' ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all' : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
})
const registerClass = computed(() => {
    return type.value === 'register' ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all' : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
})
//初始化场景
const scene = new THREE.Scene()
//记录当前模型
let currentModel: THREE.Object3D | null = null
//动画混合器
let mixer: THREE.AnimationMixer | null = null
const clock = new THREE.Clock() //动画时钟
const loadModel = (url: LoginType) => {
    if (currentModel) {
        scene.remove(currentModel)
        currentModel = null
    }
    const loader = new GLTFLoader()
    type.value = url
    if (url === 'login') {
        //加载登录模型
        loader.load('/models/login/scene.gltf', (gltf: any) => {
            scene.add(gltf.scene)
            currentModel = gltf.scene
            scene.position.y = -0.8
            gltf.scene.scale.set(1, 1, 1)
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(gltf.scene)
                gltf.animations.forEach((clip: any) => {
                    const action = mixer!.clipAction(clip)
                    action.play()
                })
                console.log(`已播放 ${gltf.animations.length} 个动画`)
            }
        })
    } else {
        //加载注册模型
        loader.load('/models/register/scene.gltf', (gltf: any) => {
            scene.add(gltf.scene)
            currentModel = gltf.scene
            scene.position.y = -0.8
            gltf.scene.scale.set(1, 1, 1)
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(gltf.scene)
                gltf.animations.forEach((clip: any) => {
                    const action = mixer!.clipAction(clip)
                    action.play()
                })
                console.log(`已播放 ${gltf.animations.length} 个动画`)
            }
        })
    }
    emits('changeType', url)
}
const initThree = () => {
    //获取元素宽高
    const width = canvasRef.value?.clientWidth
    const height = canvasRef.value?.clientHeight
    //创建相机
    const camera = new THREE.PerspectiveCamera(60, width! / height!, 0.1, 1000)
    camera.position.set(1, 1.5, 1)
    //创建渲染器
    const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value!,
        antialias: true,
        alpha: true,
        precision: 'highp',
        powerPreference: 'high-performance'
    })
    //加载模型
    loadModel(type.value)
    //设置渲染器大小和像素比
    renderer.setSize(width!, height!)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.render(scene, camera)
    //添加光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 7.5)
    scene.add(directionalLight)
    //添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    //动画循环
    const animate = () => {
        requestAnimationFrame(animate)
        if (mixer) {
            mixer.update(clock.getDelta())
        }
        controls.update()
        renderer.render(scene, camera)
    }
    animate()
}
onMounted(() => {
    initThree()
})
</script>