import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCreator() {
  try {
    const creator = await prisma.creator.upsert({
      where: { slug: 'mkurugenzi' },
      update: {
        youtubeChannelId: 'UCUgsdMs1PqV9lKItnP0UxyQ',
        displayName: 'Mkurugenzi',
      },
      create: {
        slug: 'mkurugenzi',
        displayName: 'Mkurugenzi',
        youtubeChannelId: 'UCUgsdMs1PqV9lKItnP0UxyQ',
        brandPrimaryColor: '#d11149',
        brandSecondaryColor: '#0a0a0d',
        welcomeMessage: 'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
        rewardProgramType: 'weekly',
        status: 'active',
        planTier: 'creator_pro',
      },
    })
    console.log('Successfully updated creator in Neon database:', creator)
  } catch (e) {
    console.error('Error updating creator in database:', e)
  } finally {
    await prisma.$disconnect()
  }
}

updateCreator()
