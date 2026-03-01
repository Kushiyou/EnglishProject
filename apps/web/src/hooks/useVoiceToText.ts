import { ref } from 'vue'
//声明选项属性
export interface Options {
    lang?: string //语言
    continuous?: boolean //是否连续识别 默认是false 机制 也就是说完一句话或者没有声音了就会自动停止 如果设置为true就需要手动调用stop函数停止
    interimResults?: boolean //是否显示临时结果 默认是false 类似于SSE
    maxAlternatives?: number //最大候选数 默认是1 举个例子设置为3 说了apple 可能会识别出apple、apples、apple 等
}
let instance: SpeechRecognition | null = null;

const getInstance = (options: Options): SpeechRecognition => {
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition //后边是为了兼容safari
    if (!speechRecognition) {
        throw new Error("浏览器不支持该API")
    }
    //第一次创建
    if (!instance) {
        const { lang = 'zh-CN', continuous = false, interimResults = false, maxAlternatives = 1 } = options
        instance = new speechRecognition()
        instance.lang = lang
        instance.continuous = continuous
        instance.interimResults = interimResults
        instance.maxAlternatives = maxAlternatives
    }
    return instance
}

export const useVoiceToText = (options: Options) => {
    const recognition = getInstance(options);
    //添加一个状态记录是否正在路由，用作判断
    const isRecording = ref(false)
    //监听事件是否结束
    recognition.onend = ()=>{
        isRecording.value = false
    }
    //开始录音
    const start = (callback?:(result:string)=>void) => {
        recognition.start()//开始录音
        isRecording.value = true
        //监听录音结果
        recognition.onresult = (event)=>{
            //因为这个是一段一段的，跟流式输出一样
            let fullText = ''
            for(let i = 0; i < event.results.length; i++) {
                fullText += event.results[i][0].transcript
            }
            callback?.(fullText!)
        }
    }
    //停止录音
    const stop = () => {
        recognition.stop()
        isRecording.value = false
    }
    return{
        start,
        stop,
        isRecording
    }
}