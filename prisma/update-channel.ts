import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCreator() {
  try {
    const creator = await prisma.creator.upsert({
      where: { slug: 'mkurugenzi' },
      update: {
        youtubeChannelId: 'UC4tjY2tTltEKePusozUxtSA',
        displayName: 'Mkurugenzi',
      },
      create: {
        slug: 'mkurugenzi',
        displayName: 'Mkurugenzi',
        youtubeChannelId: 'UC4tjY2tTltEKePusozUxtSA',
        brandPrimaryColor: '#d11149',
        brandSecondaryColor: '#0a0a0d',
        welcomeMessage: 'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
        rewardProgramType: 'weekly',
        status: 'active',
        planTier: 'creator_pro',
      },
    })
    console.log('Successfully updated creator to exact channel ID in Neon DB:', creator)
  } catch (e) {
    console.error('Error updating creator:', e)
  } finally {
    await prisma.$disconnect()
  }
}

updateCreator()
