import { Hono } from 'hono'
 
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'
import { cors } from 'hono/cors'
 
const app = new Hono<{ 
  Bindings:{
     DATABASE_URL: string
     JWT_SECRET: string
  }
}>();
 
  
// app/v1/user/signup
// app/v1/user/signin
// app/v1/blog/....
// first came here then route to user.ts
// first came here then route to blog.ts
app.use('/*', cors())
app.route("/api/v1/user",userRouter)
app.route("/api/v1/blog",blogRouter)
 
export default app
 