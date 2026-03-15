import { prisma } from '~~/server/prisma'

export default defineEventHandler(async (event) => {
  const unis = await prisma.uni.findMany()

  return {
    message: 'success',
    unis: unis
  }
})
