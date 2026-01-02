import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors"
import { env } from './src/config/env.js'
import userRouter from './src/routes/user/userRoutes.js';
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middlewares/common/error.middleware.js'
import logger from './src/config/logger.js';


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

app.listen(env.PORT,()=>logger.info(`Server is now running on port ${env.PORT}`))