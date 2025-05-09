import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Request, Response, Application } from 'express';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('API Gateway is alive! 🚀');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});

export default app; // Optional: export app for testing or other purposes 