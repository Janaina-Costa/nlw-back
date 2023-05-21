import 'dotenv/config'
import fastify from 'fastify';
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from  '@fastify/multipart'
import { memoriesRoute } from './routes/memories';
import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/upload';
import { resolve } from 'path';

const PORT = 3333;
const app = fastify()
app.register(multipart)
app.register(require('@fastify/static'), {
  root:resolve(__dirname, '../uploads'),
  prefix:'/uploads'
})
app.register(cors,{
  origin:true,
  allowedHeaders:'*'
})
app.register(jwt,{
  secret:'skhfqusjhdfsdfsdfnlhsohfsfhquerensdhfoshfscoisdfgsfbdswa'
})
app.register(uploadRoutes)
app.register(memoriesRoute)
app.register(authRoutes)
app.listen({
  port: PORT,
}).then(() => {
  console.log(`App is running at http://localhost:${PORT}`);
});
