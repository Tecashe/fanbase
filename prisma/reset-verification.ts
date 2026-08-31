import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetVerification() {
  try {
    const updated = await prisma.userCreatorLink.updateMany({
      data: {
        youtubeSubscriptionVerified: false,
        youtubeVerifiedAt: null,
      },
    })
    console.log(`Successfully reset ${updated.count} user links to unverified for testing!`)
  } catch (e) {
    console.error('Error resetting verification:', e)
  } finally {
    await prisma.$disconnect()
  }
}

resetVerification()
