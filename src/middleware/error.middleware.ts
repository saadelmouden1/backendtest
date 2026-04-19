
import type {Request, Response, NextFunction} from 'express'

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    const status = err.status ?? 500
    const message = err.message ?? 'Internal Server Error'

    console.error(`[ERROR] ${status} - ${message}`)

    res.status(status).json({
        success: false,
        message
    })
}