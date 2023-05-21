import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { createWriteStream } from "fs";
import { extname, resolve } from "node:path";
import {pipeline} from 'node:stream'
import {promisify} from 'node:util'

const pump = promisify(pipeline)


export async function uploadRoutes(app:FastifyInstance) {
  app.post('/upload', async (request, res)=>{
    const upload = await request.file({
      limits:{
        fieldSize:5_242_888, //5mb
      }
    })
    if(!upload){
      return res.status(400).send()
    }
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFieldFormat = mimeTypeRegex.test(upload.mimetype)

    if(!isValidFieldFormat){
      return res.status(400).send()
    }
    const fileId = randomUUID()
    const extensionOrigin = extname(upload.filename)

    const fileName = fileId.concat(extensionOrigin)

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', fileName)
    )

    await pump(upload.file, writeStream)
    const fullUrl= request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()
    
    return {fileUrl}
    
  })
}