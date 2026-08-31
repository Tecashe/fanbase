import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Neon database for Campfire...')

  // 1. Create or update primary tenant: Mkurugenzi
  const creator = await prisma.creator.upsert({
    where: { slug: 'mkurugenzi' },
    update: {},
    create: {
      slug: 'mkurugenzi',
      displayName: 'Mkurugenzi',
      youtubeChannelId: 'UC_mkurugenzi_official',
      brandPrimaryColor: '#d11149',
      brandSecondaryColor: '#0a0a0d',
      welcomeMessage: 'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
      rewardProgramType: 'weekly',
      status: 'active',
      planTier: 'creator_pro',
    },
  })

  // 2. Create Stories (Source content)
  const story1 = await prisma.story.create({
    data: {
      creatorId: creator.id,
      title: 'Episode 42: The Heist on River Road',
      youtubeVideoId: 'dQw4w9WgXcQ',
      description: 'A deep dive into the mastermind behind the Nairobi security breach.',
      airedDate: new Date('2026-08-28'),
      transcriptOrNotes: 'Key details: The blue Subaru, the 3:15 PM bank alarm, and the mysterious briefcase left at the roundabout.',
    },
  })

  const story2 = await prisma.story.create({
    data: {
      creatorId: creator.id,
      title: 'Episode 41: Secrets of the Rift Valley',
      youtubeVideoId: 'L_LUpnjgPso',
      description: 'Uncovering the hidden geothermal facility forgotten for decades.',
      airedDate: new Date('2026-08-21'),
      transcriptOrNotes: 'Key details: Wells drilled in 1984, the steam pressure valve sequence, and the old logbook.',
    },
  })

  // 3. Create Quizzes with Questions & Options
  const quiz1 = await prisma.quiz.create({
    data: {
      creatorId: creator.id,
      storyId: story1.id,
      title: 'Episode 42 Recall Quest',
      quizType: 'story_recall',
      pointsValue: 250,
      requiresWatchConfirmation: false,
      questions: {
        create: [
          {
            questionText: 'What color was the getaway car at the River Road junction?',
            questionOrder: 1,
            pointsValue: 75,
            options: {
              create: [
                { optionText: 'Midnight Blue Subaru', isCorrect: true },
                { optionText: 'Silver Toyota Prado', isCorrect: false },
                { optionText: 'White Isuzu D-Max', isCorrect: false },
                { optionText: 'Matte Black Ranger', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'What timestamp on the surveillance camera caught the alarm going off?',
            questionOrder: 2,
            pointsValue: 75,
            options: {
              create: [
                { optionText: '15:15:22 (3:15 PM)', isCorrect: true },
                { optionText: '12:00:00 (Noon)', isCorrect: false },
                { optionText: '18:45:10 (6:45 PM)', isCorrect: false },
                { optionText: '04:30:00 (Dawn)', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Where was the mysterious lockbox eventually recovered?',
            questionOrder: 3,
            pointsValue: 100,
            options: {
              create: [
                { optionText: 'Inside the old roundabout drainage culvert', isCorrect: true },
                { optionText: 'Under the hotel reception desk', isCorrect: false },
                { optionText: 'In the trunk of a commuter taxi', isCorrect: false },
                { optionText: 'Left behind at the petrol station', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  })

  const quiz2 = await prisma.quiz.create({
    data: {
      creatorId: creator.id,
      storyId: story2.id,
      title: 'Episode 41: Deep Lore Speed Bonus',
      quizType: 'speed_bonus',
      pointsValue: 300,
      requiresWatchConfirmation: true, // Watch-to-unlock gating
      questions: {
        create: [
          {
            questionText: 'In what year was the first exploratory geothermal well drilled?',
            questionOrder: 1,
            pointsValue: 150,
            options: {
              create: [
                { optionText: '1984', isCorrect: true },
                { optionText: '1976', isCorrect: false },
                { optionText: '1992', isCorrect: false },
                { optionText: '2001', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'What code was inscribed on the rusted steam pressure valve?',
            questionOrder: 2,
            pointsValue: 150,
            options: {
              create: [
                { optionText: 'VALVE-84-ALPHA', isCorrect: true },
                { optionText: 'GEOT-01', isCorrect: false },
                { optionText: 'STEAM-99', isCorrect: false },
                { optionText: 'VALVE-X', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  })

  // 4. Create Collectible Badges
  await prisma.badge.createMany({
    data: [
      {
        creatorId: creator.id,
        title: 'First Flame',
        description: 'Completed your first episode recall quest.',
        iconUrl: '🔥',
        criteriaType: 'milestone',
        criteriaConfig: { count: 1 },
      },
      {
        creatorId: creator.id,
        title: '7-Day Spark',
        description: 'Maintained a 7-day active participation streak.',
        iconUrl: '⚡',
        criteriaType: 'streak',
        criteriaConfig: { streakDays: 7 },
      },
      {
        creatorId: creator.id,
        title: 'Story Arc Master',
        description: 'Answered all questions in the Season 1 arc correctly.',
        iconUrl: '🏆',
        criteriaType: 'story_arc_complete',
        criteriaConfig: { perfectScore: true },
      },
      {
        creatorId: creator.id,
        title: 'Circle Ambassador',
        description: 'Invited 3 verified friends around the fire.',
        iconUrl: '✦',
        criteriaType: 'milestone',
        criteriaConfig: { referrals: 3 },
      },
    ],
  })

  // 5. Create Rewards Catalog
  await prisma.reward.createMany({
    data: [
      {
        creatorId: creator.id,
        title: 'Next Episode Shoutout',
        description: 'Your name recognized in the opening credits of next Friday’s episode.',
        rewardType: 'weekly',
        pointsRequired: 2500,
        quantityAvailable: 5,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        creatorId: creator.id,
        title: 'Creator’s Private Music Playlist',
        description: 'Direct access to the ambient scoring track list used in production.',
        rewardType: 'milestone',
        pointsRequired: 3000,
        quantityAvailable: 100,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        creatorId: creator.id,
        title: 'VIP Story Arc Consultation',
        description: 'Join a 30-minute private Zoom call to brainstorm upcoming lore theories.',
        rewardType: 'monthly',
        pointsRequired: 5000,
        quantityAvailable: 3,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    ],
  })

  console.log('Database seeded successfully for tenant "mkurugenzi"!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
