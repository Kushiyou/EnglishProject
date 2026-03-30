import { io, Socket } from 'socket.io-client'
import { socketUrl } from '@/apis'
import { useUserStore } from '@/stores/user'

let socket: Socket | null = null
export const useSocket = () => {
    const userStore = useUserStore()
    //链接socket
    const connect = () => {
        const userId = userStore.user?.id
        //判断是否有userid，没有直接return
        if (!userId) return
        //判断是否已经链接，如果已经连接，直接return
        if (socket) return
        //初始化连接socket
        socket = io(socketUrl, {
            transports: ['websocket'],
            autoConnect: true, //是否自动连接
            reconnection: true, //是否自动重连
            reconnectionAttempts: 5, //重连次数
            reconnectionDelay: 1000, //重连时间
            reconnectionDelayMax: 5000, //最大重连时间
            timeout: 20000, //超时时间
            query: {
                userId
            }
        })
        if(import.meta.hot){
            import.meta.hot.data.socket = socket;
        }
    }
    //断开socket
    const disconnect = () => {  
        socket?.disconnect() //关闭连接
        socket?.removeAllListeners() //移除所有监听事件
        socket = null
        if(import.meta.hot){
            import.meta.hot.data.socket = null;
        }
    }
    //获取socket
    const getSocket = ():Socket|null => {
        if(socket){
            return socket;
        }
        if(import.meta.hot){
            return import.meta.hot.data.socket;
        }
        return null;
    }
    return {
        connect,
        disconnect,
        getSocket
    }
}