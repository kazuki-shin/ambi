import { Router } from 'express';
import healthRouter from './health.routes';

const mainRouter = Router();

mainRouter.use('/health', healthRouter);

// Future routers can be added here:
// import userRouter from './user.routes';
// mainRouter.use('/users', userRouter);

export default mainRouter; 