import {Hono} from "hono"
import { decode, sign, verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge' 
import { withAccelerate } from '@prisma/extension-accelerate'
import {createBlogInput,updateBlogInput} from "@yashvishnoi/newfolder-common"


 
export const blogRouter=new Hono<{
  Bindings:{
     DATABASE_URL: string
     JWT_SECRET: string
  },
  Variables:{
    responseId:string
  }
}>();
 
blogRouter.use('/*',async(c,next)=>{

  // get header
  // verify header
  // if header is correct,we  can proceed
  // if not ,we return the user 403 status code

  const header=c.req.header("authorization") || "";
  // const token=header.split("")[1]     // "bearer" "token"
  // console.log(token)
  try{
    
    const response= await verify(header,c.env.JWT_SECRET)

    if(response){
      // @ts-ignore
      c.set("responseId",response.id);
      await next()

    }
    else{ 

      c.status(403) 
    
      return c.json({error:"unauthorized"})
    
    }
  }
  catch(e){
    c.status(403) 
    
    return c.json({error:"unauthorized"})
  } 

    
  
}) 


 blogRouter.post('/',async (c)=> { 
  
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL ,
  }).$extends(withAccelerate())
  
  const body=await c.req.json();
  const {success}=createBlogInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message:"Incorrect Inputs"
    })
  }
 const authorId=c.get('responseId')
  const blog=await prisma.blog.create({
    data:{
      title:body.title,
      content:body.content,
      authorId:Number(authorId)
    }
       
  }) 

   
  return c.json({
    id:blog.id
  })    
 
})

blogRouter.put('/',async(c)=>{ 
  
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL ,
  }).$extends(withAccelerate())
  
  const body=await c.req.json();
  const {success}=updateBlogInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message:"Incorrect Inputs"
    })
  }
  const blog=await prisma.blog.update({

    where:{
        id:body.id 
    },
    
    data:{
      title:body.title,
      content:body.content
    }
       
  })

   
  return c.json({
    id:blog.id
  }) 

}) 

// add pagination
blogRouter.get('/bulk',async (c)=>{

  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL ,
  }).$extends(withAccelerate())

  const blogs=await prisma.blog.findMany({
       select:{
         content:true,
         id:true,
         title:true,
         author:{
           select:{
             name:true
           }
         }
       }

  });

  return c.json({blogs}) 

})  

blogRouter.get('/:id', async (c)=>{ 

  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL ,
  }).$extends(withAccelerate())
  
  const id=await c.req.param("id");
  
  try{
    const blog=await prisma.blog.findFirst({
      where:{
          id:Number(id)
      }, 
      select:{
         id:true,
         title:true,
         content:true,
         author:{
             select:{
               name:true
             }
         }
      }
    })
    return c.json({
       blog:blog
    }) 
  }catch(e){
    c.status(411)
  return c.json({
    message:"Error while fetching blog post"+e
  })
  }

})  



