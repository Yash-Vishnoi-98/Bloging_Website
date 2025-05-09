import {Hono} from "hono"
import { decode, sign, verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge' 
import { withAccelerate } from '@prisma/extension-accelerate'
import { signupInput,signinInput } from "@yashvishnoi/newfolder-common"
  
export const userRouter=new Hono<{
  Bindings:{
     DATABASE_URL: string
     JWT_SECRET: string
  }
}>();

 
 
userRouter.post('/signup', async (c) => { 
  try{
       const body=await c.req.json();
const {success}=signupInput.safeParse(body);
if(!success){
  c.status(411);
  return c.json({
    message:"Incorrect Inputs"
  })
}
const prisma = new PrismaClient({
  datasourceUrl:c.env.DATABASE_URL ,
}).$extends(withAccelerate())

const user= await prisma.user.create({
    data: {
      username: body.username,
      password: body.password,
      name:body.name
    }
 })

 const token=await sign({id:user.id},c.env.JWT_SECRET)
  return c.json({jwt:token}) 
  }
  catch(e){
    console.error("Error during signup:", e);   
    return c.json({ message: "Internal yash Server Error", error: e });
  }
  

  }) 

  userRouter.post('/signin',async (c) => { 
 try{
       const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL ,
  }).$extends(withAccelerate())


  const body=await c.req.json();
  const {success}=signinInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message:"Incorrect Inputs"
    })
  }

  const user=await prisma.user.findFirst({
   where:{
      username:body.username,
      password:body.password
   }

  });
  if(!user){
    c.status(403);
    return c.json({error:'user not Found'})
  }
  const token=await sign({id:user.id},c.env.JWT_SECRET)
  return c.json({jwt:token})
 }
 catch(e){
  console.error("Error during signin:", e);   
  return c.json({ message: "Internal yash Server Error", error: e });
 } 

}) 