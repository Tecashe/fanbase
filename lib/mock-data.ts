export type Creator = {
  slug: string
  displayName: string
  handle: string
  initials: string
  primaryColor: string
  secondaryColor: string
  welcomeMessage: string
  channelUrl: string
}

export const creator: Creator = {
  slug: 'creator',
  displayName: 'Featured Creator',
  handle: '@creator',
  initials: 'FC',
  primaryColor: '#d11149',
  secondaryColor: '#272734',
  welcomeMessage: 'The internet’s tactile sanctuary for curious minds.',
  channelUrl: 'https://youtube.com',
}

export const fan = {
  name: 'Fan Member',
  initials: 'FM',
  points: 1840,
  rank: 14,
  streak: 7,
  referrals: 3,
}

export const quizzes = [
  {
    id: 'q1',
    title: 'The Big Idea',
    subtitle: 'Episode 42 · Story Recall',
    points: 250,
    duration: '3 min',
    status: 'Ready to Play',
    color: 'ruby',
    questions: [
      {
        text: 'What was the central paradox explored in this week’s breakdown?',
        options: ['A hidden city', 'The creator dilemma', 'A midnight train', 'The speed of curiosity'],
        answer: 1,
      },
      {
        text: 'Which principle was highlighted as the channel’s compass?',
        options: ['Stay relentless', 'Make it loud', 'Curiosity over comfort', 'Start from scratch'],
        answer: 2,
      },
      {
        text: 'What surprised the community most about the behind-the-scenes archival footage?',
        options: ['The uncut script', 'The microphone setup', 'The 3-year timeline', 'The guest voiceover'],
        answer: 0,
      },
    ],
  },
  {
    id: 'q2',
    title: 'Speed Round: Bright Sparks',
    subtitle: 'Episode 41 · Speed Bonus',
    points: 400,
    duration: '90 sec',
    status: 'New Today',
    color: 'ruby',
    questions: [
      {
        text: 'How many bright sparks did the community identify during the live watch-party?',
        options: ['Three', 'Five', 'Seven', 'Ten'],
        answer: 2,
      },
      {
        text: 'What was the secret easter egg hidden at minute 14:02?',
        options: ['A Morse code flicker', 'A retro sticker', 'A book title', 'A soundtrack cue'],
        answer: 0,
      },
    ],
  },
  {
    id: 'q3',
    title: 'Community Check-in: Future Roadmap',
    subtitle: 'Fan Favorites · Prediction',
    points: 150,
    duration: '5 min',
    status: 'Tomorrow',
    color: 'monochrome',
    questions: [
      {
        text: 'Which upcoming mini-documentary topic should drop first?',
        options: ['The lost archives', 'Deep dive into sound design', 'Community spotlight', 'All of the above'],
        answer: 3,
      },
    ],
  },
]

export const leaderboard = [
  { rank: 1, name: 'Kofi B.', points: 4820, initials: 'KB' },
  { rank: 2, name: 'Zainab M.', points: 4310, initials: 'ZM' },
  { rank: 3, name: 'Theo R.', points: 3960, initials: 'TR' },
  { rank: 4, name: 'Nia W.', points: 3550, initials: 'NW' },
  { rank: 5, name: 'David O.', points: 3210, initials: 'DO' },
  { rank: 14, name: 'You (Fan)', points: 1840, initials: 'YO', me: true },
]

export const rewards = [
  {
    title: 'Campfire MVP',
    description: 'A personal featured shoutout and on-screen credit in the next episode.',
    points: 'Top 10 Rank',
    meta: 'Weekly Reward',
    icon: '★',
  },
  {
    title: 'Creator’s Playlist',
    description: 'Curate 3 songs that will be featured in the official background montage.',
    points: '2,500 pts',
    meta: 'Milestone Tier',
    icon: '♫',
  },
  {
    title: 'Annual Care Package',
    description: 'A bespoke tactile box with hand-numbered artifacts and custom merchandise.',
    points: 'Top 3 Overall',
    meta: 'Annual Honor',
    icon: '✦',
  },
]

export const analytics = {
  verifiedFans: '8,492',
  completions: '72.4%',
  points: '128.6k',
  trend: '+18.2%',
}

export const referrals = {
  code: 'FAN-INVITE',
  referred: 3,
  earned: 300,
  link: 'campfire.app/[channel-slug]/r/FAN-INVITE',
}
