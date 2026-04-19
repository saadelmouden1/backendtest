
import {Server } from 'socket.io'
import type {Server as HttpServer} from 'http'

let io : Server

export const initSocket = (httpServer: HttpServer) =>
{
    io = new Server(httpServer,{
        cors: {origin: '*'}
    })
    return io
}

export const getIO = ()=>{
    if(!io) throw new Error('Socket.io not iniialized')
    return io
}