import { prisma } from '~~/server/prisma'

export default defineEventHandler(async (_) => {
  const unis = await prisma.uni.findMany()

  return {
    message: 'success',
    unis: unis
  }
})
