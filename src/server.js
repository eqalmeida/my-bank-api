import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountRouter from './routes/accountRouter.js';
import './db/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/account', accountRouter);

const TCP_PORT = process.env.TCP_PORT || 3000;

app.listen(process.env.PORT || TCP_PORT, () => {
  console.log('App running on port ' + TCP_PORT);
});
