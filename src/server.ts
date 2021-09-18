import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  console.info(req.headers, req.body);

  res.send({"message": "Hello, world!"});
});

app.listen(process.env.SERVER_PORT);
