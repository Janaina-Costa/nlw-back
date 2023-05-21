import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from  'zod'


export async function memoriesRoute(app:FastifyInstance) {
  app.addHook('preHandler', async(request)=>{
    await request.jwtVerify()
  })
  app.get('/memories', async (request) => {
   
    const memories = await prisma.memory.findMany({
      where:{
        userId: request.user.sub
      },
      orderBy:{
        createdAt:'asc'
      }
    })

    return memories.map(memo=>{
      return{
        id: memo.id,
        coverUrl: memo.coverUrl,
        excerpt: memo.content.substring(0,300).concat('...')
      }
    })
  });

  app.get('/memories/:id', async(req, res)=>{
    const paramsSquema = z.object({
      id:z.string().uuid()
    })
    const id = paramsSquema.parse(req.params)

    const memory = await prisma.memory.findUnique({
      where:{
        id: id.id
      }
    })
    if(!memory?.isPublic && memory?.userId !== req.user.sub){
      return res.status(401).send()
    }
    return memory
  })

  app.post('/memories', async(req)=>{
    const bodySquema = z.object({
      content:z.string(),
      coverUrl:z.string(),
      isPublic:z.coerce.boolean().default(false)
    })

    const{content, coverUrl, isPublic} = bodySquema.parse(req.body)

    const memory = await prisma.memory.create({
      data:{
        content,
        coverUrl,
        isPublic,
        userId:req.user.sub
      }
    })
    return memory
  })

  app.put('/memories/:id', async(req, res)=>{
    const paramsSquema = z.object({
      id:z.string().uuid()
    })
    const id = paramsSquema.parse(req.params)

    const bodySquema = z.object({
      content:z.string(),
      coverUrl:z.string(),
      isPublic:z.coerce.boolean().default(false)
    })

    const{content, coverUrl, isPublic} = bodySquema.parse(req.body)
    let memory = await prisma.memory.findUniqueOrThrow({
      where:{
        id:id.id
      }
    })

    if(memory.userId !== req.user.sub){
      return res.status(401).send()
    }

     memory = await prisma.memory.update({
      where:{
        id:id.id
      },
      data:{
        content,
        coverUrl,
        isPublic,

      }
    })

    return memory

  })

  app.delete('/memories/:id', async(req, res)=>{
    const paramsSquema = z.object({
      id:z.string().uuid()
    })
    const id = paramsSquema.parse(req.params)
    const memory = await prisma.memory.findFirstOrThrow({
      where:{
        id:id.id
      }
    })
    if(memory.userId !== req.user.sub  ){
      return res.status(401).send()
    }
     await prisma.memory.delete({
      where:{
        id: id.id
      }
    })
  
  })
}
