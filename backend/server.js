import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors"
import userRouter from './routes/user/userRoutes.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { errorHandler } from './middlewares/common/error.middleware.js'


const app = express();

app.use(
    cors({
        origin: env.CLIENT_ORIGIN,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/",userRouter)


app.use(errorHandler)
await connectDB()

app.listen(env.PORT,()=>console.log(`Server is now running on port ${env.PORT}`))