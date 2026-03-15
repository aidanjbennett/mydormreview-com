import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { twoFactor } from 'better-auth/plugins'

export const auth = betterAuth({
  appName: 'My Dorm Review',
  emailAndPassword: {
    enabled: true
  },
  plugins: [twoFactor()],
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  })
})
