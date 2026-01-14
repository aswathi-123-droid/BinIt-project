import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from "cors"
import { env } from './src/config/env.js'
import userRouter from './src/routes/user/userRoutes.js';
import adminRouter from "./src/routes/admin/adminRoutes.js"
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middlewares/common/error.middleware.js'
import logger from './src/config/logger.js';

const app = express();
const PORT = process.env.PORT || 5000


app.use(
    cors({
        origin: ["http://localhost:5173", "https://c9zml8qd-5173.inc1.devtunnels.ms", env.CLIENT_ORIGIN],
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
        credentials: true
    })
);

app.use(cookieParser());
app.use(express.json());


app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/", userRouter)


app.use(errorHandler)
await connectDB()

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`))