import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from './supabase'
import './App.css'

type CardType = 'C' | 'D' | 'G' | 'A' | 'P'
type Difficulty = 'Easy' | 'Medium' | 'Hard'

function getLevelPoints(level: number): number {
  if (level === 1) return 3
  if (level === 2) return 6
  return 10
}

type BoardSpace = {
  position: number
  name: string
  type?: CardType
}

type Question = {
  id: number
  level: number
  difficulty?: Difficulty
  question: string
  answers: string[]
  points: number
  time: number
  information: string
  required: number
}

type PointMode = 'solo' | 'group'

type PlayerData = {
  name: string
  playerId: string
  points: number
  position: number
  usedQuestions: {
    A: number[]
    G: number[]
    D: number[]
  }
}
function generateRewardCode() {
  return (
    'HDQ-' +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  )
}
const REWARDS = [
  {
    id: 'stay',
    name: 'Stay Experience',
    points: 100,
    description:
      'Stay 3, Pay 2 — Enjoy one complimentary night when staying for 3 nights'
  },
  {
    id: 'spa',
    name: 'Satkara Spa',
    points: 70,
    description:
      '10% OFF Satkara Spa services'
  },
  {
    id: 'dining',
    name: 'Dining Treat',
    points: 30,
    description:
      '10% OFF dining at The River Grill & River Café'
  },
  {
    id: 'tea',
    name: 'Afternoon Tea',
    points: 15,
    description:
      'Weekend Afternoon Tea Set for 2 persons'
  }
]
function App() {
  type Screen =
  | 'home'
  | 'setup'
  | 'board'
  | 'question'
  | 'challenge'
  | 'discovery'
  | 'reward'

const [screen, setScreen] =
  useState<Screen>('home')
  const [showContinueChoice, setShowContinueChoice] =
  useState(false)

  const [gameId, setGameId] = useState('')
  
  // QR card detected from physical card
  const [qrCardType, setQrCardType] =
  useState<CardType | 'START' | null>(null)
    const [showScanner, setShowScanner] =
  useState(false)
    

  const [players, setPlayers] = useState(1)
  
  const [pointMode, setPointMode] =
  useState<PointMode>('solo')

const [rewardClaimCode, setRewardClaimCode] =
  useState('')

const [rewardClaimed, setRewardClaimed] =
  useState(false)

  const [hasPlayedBefore, setHasPlayedBefore] =
    useState<boolean | null>(null)

  const [playerNames, setPlayerNames] =
    useState<string[]>([''])

  const [currentPlayer, setCurrentPlayer] =
    useState(0)

  const [playerData, setPlayerData] =
    useState<PlayerData[]>([
      {
        name: '',
        playerId: '',
        points: 0,
        position: 0,
        usedQuestions: {
          A: [],
          G: [],
          D: []
        }
      }
    ])

  const [round, setRound] = useState(1)

  const [, setSelectedCard] =
    useState<CardType | null>(null)

  const [currentQuestion, setCurrentQuestion] =
    useState<Question | null>(null)

  const [answer, setAnswer] = useState('')

  const [timeLeft, setTimeLeft] = useState(60)

  const [cardNumber, setCardNumber] = useState(0)


  /*
  =========================================
  BOARD
  =========================================
  */

  const board: BoardSpace[] = [
    { position: 0, name: 'Start' },

    { position: 1, name: 'Chance', type: 'C' },
    { position: 2, name: 'Discovery', type: 'D' },
    { position: 3, name: 'Challenge', type: 'G' },
    { position: 4, name: 'Penalty', type: 'P' },
    { position: 5, name: 'Attraction', type: 'A' },
    { position: 6, name: 'Challenge', type: 'G' },

    { position: 7, name: 'Asam Pedas' },

    { position: 8, name: 'Discovery', type: 'D' },
    { position: 9, name: 'Chance', type: 'C' },
    { position: 10, name: 'Penalty', type: 'P' },
    { position: 11, name: 'Attraction', type: 'A' },
    { position: 12, name: 'Challenge', type: 'G' },
    { position: 13, name: 'Chance', type: 'C' },
    { position: 14, name: 'Attraction', type: 'A' },
    { position: 15, name: 'Penalty', type: 'P' },
    { position: 16, name: 'Discovery', type: 'D' },
    { position: 17, name: 'Challenge', type: 'G' },

    { position: 18, name: 'Waiting Lobby' },

    { position: 19, name: 'Penalty', type: 'P' },
    { position: 20, name: 'Attraction', type: 'A' },
    { position: 21, name: 'Chance', type: 'C' },
    { position: 22, name: 'Challenge', type: 'G' },
    { position: 23, name: 'Discovery', type: 'D' },
    { position: 24, name: 'Attraction', type: 'A' },

    { position: 25, name: 'Cendol' },

    { position: 26, name: 'Chance', type: 'C' },
    { position: 27, name: 'Penalty', type: 'P' },
    { position: 28, name: 'Attraction', type: 'A' },
    { position: 29, name: 'Challenge', type: 'G' },
    { position: 30, name: 'Discovery', type: 'D' },
    { position: 31, name: 'Chance', type: 'C' },
    { position: 32, name: 'Attraction', type: 'A' },
    { position: 33, name: 'Discovery', type: 'D' },
    { position: 34, name: 'Challenge', type: 'G' },
    { position: 35, name: 'Penalty', type: 'P' }
  ]

  /*
  =========================================
  ATTRACTION QUESTIONS
  =========================================
  */

  const attractionQuestions: Question[] = [
    {
      id: 1,
      level: 1,
      question: 'Name 3 famous attractions in Melaka.',
      answers: [
        'a famosa',
        'jonker street',
        'christ church',
        'st pauls church',
        'melaka river cruise',
        'dutch square'
      ],
      points: 3,
      time: 30,
      required: 3,
      information:
        'Popular attractions include A Famosa, Jonker Street, Christ Church and Melaka River Cruise.'
    },
    {
      id: 2,
      level: 1,
      question: 'Name 2 famous foods from Melaka.',
      answers: [
        'cendol',
        'chicken rice ball',
        'chicken rice balls',
        'satay celup',
        'asam pedas',
        'nyonya food'
      ],
      points: 3,
      time: 20,
      required: 2,
      information:
        'Melaka is famous for cendol, chicken rice balls, satay celup and asam pedas.'
    },
    {
      id: 3,
      level: 1,
      question: 'Name 3 historical places in Melaka.',
      answers: [
        'a famosa',
        'christ church',
        'st pauls church',
        'stadthuys',
        'dutch square',
        'red square'
      ],
      points: 3,
      time: 30,
      required: 3,
      information:
        'Melaka has many important historical places.'
    },
    {
      id: 4,
      level: 2,
      question: 'Name 2 things you can do at Jonker Street.',
      answers: [
        'shopping',
        'eat',
        'eating',
        'food',
        'night market',
        'visit shops',
        'buy souvenirs'
      ],
      points: 6,
      time: 20,
      required: 2,
      information:
        'Jonker Street is famous for food, shopping and souvenirs.'
    },
    {
      id: 5,
      level: 2,
      question: 'Name 3 historical landmarks in Melaka.',
      answers: [
        'a famosa',
        'christ church',
        'st pauls church',
        'stadthuys',
        'dutch square'
      ],
      points: 6,
      time: 30,
      required: 3,
      information:
        'Melaka is well known for its historical landmarks.'
    },
    {
      id: 6,
      level: 2,
      question: 'Name 2 popular local dishes from Melaka.',
      answers: [
        'asam pedas',
        'chicken rice ball',
        'chicken rice balls',
        'satay celup',
        'nyonya food',
        'cendol'
      ],
      points: 6,
      time: 20,
      required: 2,
      information:
        'Melaka has many famous local foods.'
    },
    {
      id: 7,
      level: 2,
      question:
        'Name 3 places tourists can visit near Casa del Rio Melaka.',
      answers: [
        'jonker street',
        'a famosa',
        'christ church',
        'melaka river',
        'melaka river cruise',
        'st pauls church',
        'dutch square'
      ],
      points: 6,
      time: 30,
      required: 3,
      information:
        'Casa del Rio Melaka is close to many historical attractions.'
    },
    {
      id: 8,
      level: 2,
      question:
        'Name 3 attractions located around the Melaka River.',
      answers: [
        'jonker street',
        'melaka river cruise',
        'red square',
        'dutch square',
        'christ church',
        'a famosa'
      ],
      points: 6,
      time: 30,
      required: 3,
      information:
        'The Melaka River area is surrounded by many attractions.'
    },
    {
      id: 9,
      level: 3,
      question:
        'Name 3 activities tourists can do in Melaka.',
      answers: [
        'shopping',
        'sightseeing',
        'river cruise',
        'eating',
        'food hunting',
        'visit museum',
        'take photos'
      ],
      points: 10,
      time: 30,
      required: 3,
      information:
        'Tourists can enjoy sightseeing, shopping, food and river cruises.'
    },
    {
      id: 10,
      level: 3,
      question:
        'Name 3 museums or historical sites tourists can visit in Melaka.',
      answers: [
        'maritime museum',
        'baba nyonya museum',
        'st pauls church',
        'a famosa',
        'stadthuys',
        'history museum'
      ],
      points: 10,
      time: 30,
      required: 3,
      information:
        'Melaka has many museums and historical sites.'
    },
    {
      id: 11,
      level: 3,
      question:
        'Name 4 attractions that show the historical character of Melaka.',
      answers: [
        'a famosa',
        'christ church',
        'stadthuys',
        'dutch square',
        'st pauls church',
        'jonker street'
      ],
      points: 10,
      time: 35,
      required: 4,
      information:
        'Melaka is known for its rich historical and cultural heritage.'
    },
    {
      id: 12,
      level: 3,
      question:
        'Name 5 attractions a first-time visitor should consider visiting in Melaka.',
      answers: [
        'a famosa',
        'jonker street',
        'christ church',
        'st pauls church',
        'melaka river cruise',
        'dutch square',
        'stadthuys'
      ],
      points: 10,
      time: 40,
      required: 5,
      information:
        'Melaka offers many historical, cultural and recreational attractions.'
    }
  ]

  /*
  =========================================
  CHALLENGE QUESTIONS
  =========================================
  */

  const challengeQuestions: Question[] = [
    {
      id: 1,
      level: 1,
      question:
        'Name 5 things you can find inside a hotel room.',
      answers: [
        'bed',
        'television',
        'tv',
        'wardrobe',
        'desk',
        'chair',
        'towel',
        'bathroom',
        'mini fridge',
        'safe'
      ],
      points: 3,
      time: 30,
      required: 5,
      information:
        'Common hotel room items include beds, televisions, wardrobes and bathroom facilities.'
    },
    {
      id: 2,
      level: 1,
      question: 'Name 3 hotel departments.',
      answers: [
        'front office',
        'housekeeping',
        'food and beverage',
        'f&b',
        'human resources',
        'sales',
        'marketing',
        'engineering',
        'security'
      ],
      points: 3,
      time: 20,
      required: 3,
      information:
        'Hotels have different departments working together to provide guest services.'
    },
    {
      id: 3,
      level: 1,
      question: 'Name 4 hotel services.',
      answers: [
        'room service',
        'housekeeping',
        'concierge',
        'bell service',
        'laundry',
        'front office',
        'wake up call',
        'transportation'
      ],
      points: 3,
      time: 30,
      required: 4,
      information:
        'Hotels provide many services to improve guest experience.'
    },
    {
      id: 4,
      level: 1,
      question:
        'Name 3 items commonly found at a hotel breakfast buffet.',
      answers: [
        'bread',
        'egg',
        'eggs',
        'cereal',
        'fruit',
        'sausage',
        'chicken',
        'coffee',
        'tea',
        'juice'
      ],
      points: 6,
      time: 20,
      required: 3,
      information:
        'Breakfast buffets commonly provide bread, eggs, cereal, fruit and beverages.'
    },
    {
      id: 5,
      level: 2,
      question: 'Name 2 hotel facilities.',
      answers: [
        'swimming pool',
        'pool',
        'gym',
        'restaurant',
        'spa',
        'meeting room',
        'parking',
        'business centre'
      ],
      points: 6,
      time: 20,
      required: 2,
      information:
        'Hotels can provide facilities such as pools, gyms, restaurants and spas.'
    },
    {
      id: 6,
      level: 2,
      question:
        'Name 3 ways to maintain food safety in a hotel kitchen.',
      answers: [
        'wash hands',
        'hand washing',
        'clean equipment',
        'proper storage',
        'store food properly',
        'wear gloves',
        'cook food properly',
        'keep food covered',
        'check temperature'
      ],
      points: 6,
      time: 30,
      required: 3,
      information:
        'Food safety includes hygiene, proper storage, cooking and cleaning.'
    },
    {
      id: 7,
      level: 2,
      question:
        'Name 3 hotel departments that help provide good guest service.',
      answers: [
        'front office',
        'housekeeping',
        'food and beverage',
        'f&b',
        'engineering',
        'security',
        'concierge'
      ],
      points: 6,
      time: 25,
      required: 3,
      information:
        'Many hotel departments work together to provide good guest service.'
    },
    {
      id: 8,
      level: 2,
      question:
        'Name 3 responsibilities of the front office department.',
      answers: [
        'check in',
        'check-in',
        'check out',
        'check-out',
        'reservation',
        'guest service',
        'registration'
      ],
      points: 6,
      time: 30,
      required: 3,
      information:
        'Front office staff handle check-in, check-out, reservations and guest services.'
    },
    {
      id: 9,
      level: 3,
      question:
        'Name 3 responsibilities of housekeeping.',
      answers: [
        'clean rooms',
        'room cleaning',
        'cleaning',
        'make beds',
        'replace towels',
        'clean bathroom',
        'maintain cleanliness'
      ],
      points: 10,
      time: 30,
      required: 3,
      information:
        'Housekeeping maintains cleanliness and prepares guest rooms.'
    },
    {
      id: 10,
      level: 3,
      question:
        'Name 4 qualities of good hotel staff.',
      answers: [
        'friendly',
        'polite',
        'helpful',
        'patient',
        'professional',
        'responsible',
        'respectful',
        'communication'
      ],
      points: 10,
      time: 35,
      required: 4,
      information:
        'Good hotel employees should be professional, helpful, polite and responsible.'
    },
    {
      id: 11,
      level: 3,
      question:
        'Name 4 ways a hotel can improve guest satisfaction.',
      answers: [
        'good service',
        'fast service',
        'clean rooms',
        'friendly staff',
        'complaint handling',
        'facilities',
        'personalized service',
        'communication'
      ],
      points: 10,
      time: 35,
      required: 4,
      information:
        'Good service, cleanliness and effective communication can improve satisfaction.'
    },
    {
      id: 12,
      level: 3,
      question:
        'Name 5 things hotel staff can do to create a memorable guest experience.',
      answers: [
        'friendly service',
        'personalized service',
        'welcome drink',
        'quick service',
        'help guests',
        'remember guest preferences',
        'solve complaints',
        'give information'
      ],
      points: 10,
      time: 40,
      required: 5,
      information:
        'Personalized and friendly service can create memorable guest experiences.'
    }
  ]

  /*
  =========================================
  DISCOVERY QUESTIONS
  =========================================
  */

  const discoveryQuestions: Question[] = [
    {
      id: 1,
      level: 1,
      question:
        'Name 1 F&B service offered by a hotel.',
      answers: [
        'restaurant',
        'room service',
        'cafe',
        'café',
        'bar',
        'buffet'
      ],
      points: 3,
      time: 20,
      required: 1,
      information:
        'Examples include restaurants, room service, cafés and bars.'
    },
    {
      id: 2,
      level: 1,
      question:
        'Name the road where Casa del Rio Melaka is located.',
      answers: ['jalan kota laksamana'],
      points: 3,
      time: 20,
      required: 1,
      information:
        'Casa del Rio Melaka is located along Jalan Kota Laksamana.'
    },
    {
      id: 3,
      level: 1,
      question:
        'Name 3 pieces of equipment found in a hotel kitchen.',
      answers: [
        'oven',
        'refrigerator',
        'fridge',
        'blender',
        'freezer',
        'food processor',
        'mixer',
        'stove',
        'cooker'
      ],
      points: 3,
      time: 30,
      required: 3,
      information:
        'Hotel kitchens use equipment such as ovens, refrigerators and blenders.'
    },
    {
      id: 4,
      level: 1,
      question:
        'Name 1 popular local food from Melaka.',
      answers: [
        'chicken rice ball',
        'chicken rice balls',
        'nyonya food',
        'satay celup',
        'cendol',
        'asam pedas'
      ],
      points: 6,
      time: 20,
      required: 1,
      information:
        'Popular Melaka foods include chicken rice balls, Nyonya food, satay celup, cendol and asam pedas.'
    },
    {
      id: 5,
      level: 2,
      question:
        'Name 2 hotel services that help guests.',
      answers: [
        'concierge',
        'bell service',
        'room service',
        'housekeeping',
        'front office',
        'laundry',
        'transportation'
      ],
      points: 6,
      time: 20,
      required: 2,
      information:
        'Hotels provide services such as concierge, bell service, housekeeping and room service.'
    },
    {
      id: 6,
      level: 2,
      question:
        'Name 2 facilities that can be found in a hotel.',
      answers: [
        'swimming pool',
        'pool',
        'gym',
        'restaurant',
        'spa',
        'parking',
        'meeting room'
      ],
      points: 6,
      time: 20,
      required: 2,
      information:
        'Hotel facilities may include swimming pools, gyms, restaurants, spas and meeting rooms.'
    },
    {
      id: 7,
      level: 2,
      question:
        'Name 2 hotel departments that work directly with guests.',
      answers: [
        'front office',
        'food and beverage',
        'f&b',
        'housekeeping',
        'concierge'
      ],
      points: 6,
      time: 20,
      required: 2,
      information:
        'Front office, F&B, housekeeping and concierge can interact with guests.'
    },
    {
      id: 8,
      level: 2,
      question:
        'Name 3 things guests can request from the front office.',
      answers: [
        'room information',
        'extra key',
        'wake up call',
        'transportation',
        'reservation',
        'late checkout',
        'late check out'
      ],
      points: 6,
      time: 25,
      required: 3,
      information:
        'Guests can request many services and information from the front office.'
    },
    {
      id: 9,
      level: 3,
      question:
        'Name 3 sustainable practices a hotel can use.',
      answers: [
        'save water',
        'save electricity',
        'recycling',
        'recycle',
        'reduce plastic',
        'reuse towels',
        'energy saving'
      ],
      points: 10,
      time: 30,
      required: 3,
      information:
        'Hotels can reduce environmental impact through water, energy and waste management.'
    },
    {
      id: 10,
      level: 3,
      question:
        'Name 3 things tourists can learn about Melaka culture.',
      answers: [
        'nyonya culture',
        'history',
        'food',
        'traditional food',
        'heritage',
        'architecture',
        'local customs'
      ],
      points: 10,
      time: 30,
      required: 3,
      information:
        'Melaka has a rich cultural and historical heritage.'
    },
    {
      id: 11,
      level: 3,
      question:
        'Name 4 services that can make a hotel stay more convenient.',
      answers: [
        'room service',
        'laundry',
        'concierge',
        'transportation',
        'wake up call',
        'housekeeping',
        'bell service'
      ],
      points: 10,
      time: 35,
      required: 4,
      information:
        'Hotel services can make the guest stay more convenient and comfortable.'
    },
    {
      id: 12,
      level: 3,
      question:
        'Name 5 things a tourist should consider when choosing a hotel.',
      answers: [
        'location',
        'price',
        'facilities',
        'cleanliness',
        'reviews',
        'service',
        'room',
        'safety',
        'breakfast'
      ],
      points: 10,
      time: 40,
      required: 5,
      information:
        'Location, price, facilities, cleanliness and service are important when choosing a hotel.'
    }
  ]

 /*
=========================================
SAVE GAME AUTOMATICALLY
=========================================
*/

useEffect(() => {
  if (!gameId) return

  const gameData = {
    gameId,
    players,
    playerNames,
    currentPlayer,
    playerData,
    round,
    pointMode,
    rewardClaimCode,
    rewardClaimed
  }

  localStorage.setItem(
    `hotelDiscoveryQuest_${gameId}`,
    JSON.stringify(gameData)
  )

  playerNames.forEach(name => {
    const cleanName = name.trim().toLowerCase()

    if (cleanName) {
      localStorage.setItem(
        `hotelDiscoveryQuest_name_${cleanName}`,
        gameId
      )
    }
  })
}, [
  gameId,
  players,
  playerNames,
  currentPlayer,
  playerData,
  round,
  pointMode,
  rewardClaimCode,
  rewardClaimed
])

/*
=========================================
CAMERA QR SCANNER
=========================================
*/
useEffect(() => {
  if (!showScanner) return

  const scanner = new Html5Qrcode('qr-reader')

  scanner.start(
    { facingMode: 'environment' },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    async (decodedText) => {
      console.log('QR SCANNED:', decodedText)

      let cardId: string | null = null

      /*
      =========================================
      FORMAT 1
      HDQ:A1
      HDQ:G1
      HDQ:D1
      HDQ:C1
      HDQ:P1
      =========================================
      */

      if (
        decodedText
          .trim()
          .toUpperCase()
          .startsWith('HDQ:')
      ) {
        cardId =
          decodedText
            .trim()
            .substring(4)
            .toUpperCase()
      }

      /*
      =========================================
      FORMAT 2
      FULL URL

      Example:
      https://yourwebsite.com/?card=A1
      =========================================
      */

      if (!cardId) {
        try {
          const url =
            new URL(
              decodedText.trim()
            )

          const value =
            url.searchParams
              .get('card')
              ?.toUpperCase()

          if (value) {
            cardId = value
          }
        } catch {
          // Not a URL
        }
      }
      
      /*
=========================================
CHECK CARD ID
=========================================
*/

if (!cardId) {
  alert(
    `❌ Invalid Hotel Discovery Quest QR.\n\n` +
    `Scanned:\n${decodedText}`
  )

  return
}

/*
=========================================
CHECK CARD FORMAT
=========================================

A = Attraction
G = Challenge
D = Discovery
C = Chance
P = Penalty

Examples:
A1
A2
G1
D1
C1
P1
=========================================
*/

const match =
  cardId.match(
    /^(A|G|D|C|P)(\d+)$/
  )

if (!match) {
  alert(
    `❌ Invalid card number.\n\n` +
    `Scanned card: ${cardId}\n\n` +
    `Example valid cards:\n` +
    `A1, A2, G1, D1, C1, P1`
  )

  return
}

const cardType =
  match[1] as CardType

const cardNumber =
  Number(match[2])

console.log(
  'CARD TYPE:',
  cardType
)

console.log(
  'CARD NUMBER:',
  cardNumber
)

/*
=========================================
CARD SCANNED SUCCESSFULLY
=========================================
*/

setCardNumber(cardNumber)
setSelectedCard(cardType)
setAnswer('')


      /*
=========================================
STOP CAMERA
=========================================
*/

await scanner.stop()

setShowScanner(false)

/*
=========================================
SAVE SCANNED CARD
=========================================
*/

setQrCardType(cardType)
setCardNumber(cardNumber)

chooseLandedCard(
  cardType,
  cardNumber
)
/*
=========================================
GET RANDOM QUESTION AFTER SCAN
=========================================
*/

if (
  cardType === 'A' ||
  cardType === 'G' ||
  cardType === 'D'
) {
  const question =
    getRandomQuestionForCard(cardType)

  if (!question) {
    alert(
      '⚠️ No question found for this card.'
    )
    return
  }

  setCurrentQuestion(question)

  setTimeLeft(question.time)

  if (cardType === 'A') {
    setScreen('question')
  }

  if (cardType === 'G') {
    setScreen('challenge')
  }

  if (cardType === 'D') {
    setScreen('discovery')
  }

  return
}

/*
=========================================
CHANCE CARD
=========================================
*/

if (cardType === 'C') {
  showChanceCard()
  return
}

/*
=========================================
PENALTY CARD
=========================================
*/

if (cardType === 'P') {
  showPenaltyCard()
  return
}

      /*
      =========================================
      NEXT STEP
      =========================================

      We will add the random question
      based on Round / Level here.
      =========================================
      */

    },
    () => {
      // Ignore normal camera scanning errors
    }
  ).catch(() => {
    alert(
      '⚠️ Camera could not be opened. Please allow camera permission.'
    )

    setShowScanner(false)
  })

  return () => {
    scanner
      .stop()
      .catch(() => {})
  }
}, [showScanner])

/*
=========================================
QR URL → QUESTION
=========================================
*/

useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  )

  const card =
    params.get('card')?.toUpperCase()

  if (!card) return

  const match =
    card.match(/^(A|G|D|C|P)(\d+)$/)

  if (!match) return

  const cardType =
    match[1] as CardType

  const cardNumber =
    Number(match[2])

  console.log(
    'QR CARD:',
    cardType,
    cardNumber
  )

  setQrCardType(cardType)
  setCardNumber(cardNumber)
  setSelectedCard(cardType)
  setAnswer('')

  if (cardType === 'A') {
    const question =
      getRandomQuestionForCard('A')

    if (!question) {
      alert(
        '⚠️ No Attraction question found.'
      )
      return
    }

    setCurrentQuestion(question)
    setTimeLeft(question.time)
    setScreen('question')
    return
  }

  if (cardType === 'G') {
    const question =
      getRandomQuestionForCard('G')

    if (!question) {
      alert(
        '⚠️ No Challenge question found.'
      )
      return
    }

    setCurrentQuestion(question)
    setTimeLeft(question.time)
    setScreen('challenge')
    return
  }

  if (cardType === 'D') {
    const question =
      getRandomQuestionForCard('D')

    if (!question) {
      alert(
        '⚠️ No Discovery question found.'
      )
      return
    }

    setCurrentQuestion(question)
    setTimeLeft(question.time)
    setScreen('discovery')
    return
  }

  if (cardType === 'C') {
    showChanceCard()
    return
  }

  if (cardType === 'P') {
    showPenaltyCard()
    return
  }
}, [])
  
  /*
=========================================
TIMER
=========================================
*/

useEffect(() => {
  if (
    screen !== 'question' &&
    screen !== 'challenge' &&
    screen !== 'discovery'
  ) {
    return
  }

  if (timeLeft <= 0) {
    return
  }

  const timer = setTimeout(() => {
    setTimeLeft(previous => previous - 1)
  }, 1000)

  return () => {
    clearTimeout(timer)
  }
}, [screen, timeLeft])

useEffect(() => {
  if (
    timeLeft === 0 &&
    (
      screen === 'question' ||
      screen === 'challenge' ||
      screen === 'discovery'
    )
  ) {
    handleTimeUp()
  }
}, [timeLeft, screen])

  /*
  =========================================
  PLAYER SETUP
  =========================================
  */

  function choosePlayers(number: number) {
    setPlayers(number)

    setPlayerNames(
      Array(number).fill('')
    )

    setPlayerData(
      Array.from(
        { length: number },
        () => ({
          name: '',
          playerId: '',
          points: 0,
          position: 0,
          usedQuestions: {
            A: [],
            G: [],
            D: []
          }
        })
      )
    )
  }

  function updateName(
    index: number,
    value: string
  ) {
    const cleanValue = value.toLowerCase()
  
    const names = [...playerNames]
  
    names[index] = cleanValue
  
    setPlayerNames(names)
  
    const updated = [...playerData]
  
    updated[index] = {
      ...updated[index],
      name: cleanValue
    }
  
    setPlayerData(updated)
  }

/*
=========================================
SAVE GAME TO SUPABASE
=========================================
*/

async function saveGameToSupabase(
  gameId: string,
  mode: PointMode,
  playerData: PlayerData[],
  round: number
) {
  const { error } = await supabase
    .from('games')
    .upsert({
      game_id: gameId,
      mode: mode,
      players: playerData,
      round: round
    })

  if (error) {
    console.error(
      'Could not save game:',
      error
    )

    alert(
      '⚠️ Game could not be saved.\n\n' +
      'Please check your internet connection.'
    )

    return false
  }

  console.log(
    '✅ Game saved:',
    gameId
  )

  return true
}

  /*
  =========================================
  START GAME
  =========================================
  */
  async function startGame() {
    console.log('START GAME CLICKED')
    const cleanNames = playerNames.map(name =>
      name.trim().toLowerCase()
    )
  
    if (cleanNames.some(name => !name)) {
      alert(
        '⚠️ Please enter a name for every player.'
      )
      return
    }
  
    // Check duplicate names inside this game
    const duplicateNames = cleanNames.some(
      (name, index) =>
        cleanNames.findIndex(
          other => other === name
        ) !== index
    )
  
    if (duplicateNames) {
      alert(
        '⚠️ Each player must have a different name.'
      )
      return
    }
  
    /*
    =========================================
    CREATE NEW GAME
    =========================================
    */
    console.log('PASSED PLAYER CHECKS')
    const newGameId =
      'HQ-' +
      Math.floor(
        1000 +
        Math.random() * 9000
      )
  
    const newRewardCode =
      generateRewardCode()
  
    setRewardClaimCode(
      newRewardCode
    )
  
    setRewardClaimed(false)
  
    const newPlayerData =
      cleanNames.map(
        (name, index) => ({
          name,
          playerId:
            `${newGameId}-P${index + 1}`,
          points: 0,
          position: 0,
          usedQuestions: {
            A: [],
            G: [],
            D: []
          }
        })
      )
  
    setGameId(newGameId)
    setCurrentPlayer(0)
    setRound(1)
    setPlayerData(newPlayerData)
  
    const gameData = {
      gameId: newGameId,
      players,
      playerNames: cleanNames,
      currentPlayer: 0,
      playerData: newPlayerData,
      round: 1,
      pointMode,
      rewardClaimCode: newRewardCode,
      rewardClaimed: false
    }
  
    localStorage.setItem(
      `hotelDiscoveryQuest_${newGameId}`,
      JSON.stringify(gameData)
    )
  
    // Save to Supabase without blocking the game
saveGameToSupabase(
  newGameId,
  pointMode,
  newPlayerData,
  1
).catch(error => {
  console.error(
    'Supabase save failed:',
    error
  )
})

cleanNames.forEach(name => {
      localStorage.setItem(
        `hotelDiscoveryQuest_name_${name}`,
        newGameId
      )
    })
    console.log('GOING TO BOARD')
    setScreen('board')
  
    alert(
      `🎉 Game Created!\n\n` +
      `Welcome, ${cleanNames[0]}!\n\n` +
      `🎮 Game ID: ${newGameId}\n\n` +
      `🆔 Player ID: ${newPlayerData[0].playerId}\n\n` +
      `Your game has been saved automatically.`
    )
  }

/*
=========================================
CONTINUE GAME
=========================================
*/

async function continueGame() {

  /*
  =========================================
  ASK FOR GAME ID
  =========================================
  */

  const enteredGameId = prompt(
    '🎮 Enter your Game ID\n\n' +
    'Example: HQ-4821'
  )

  if (!enteredGameId) return

  const cleanGameId =
    enteredGameId.trim().toUpperCase()


  /*
  =========================================
  ASK FOR PLAYER NAME
  =========================================
  */

  const playerName = prompt(
    '👤 Enter your player name\n\n' +
    'Example: Zati'
  )

  if (!playerName) return

  const cleanName =
    playerName.trim().toLowerCase()


  /*
  =========================================
  FIND GAME IN SUPABASE
  =========================================
  */

  const { data: game, error } =
    await supabase
      .from('games')
      .select('*')
      .eq('game_id', cleanGameId)
      .single()


  if (error || !game) {

    console.error(
      'Could not find game:',
      error
    )

    alert(
      '❌ Game not found.\n\n' +
      'Please check your Game ID.'
    )

    return
  }


  /*
  =========================================
  LOAD PLAYERS
  =========================================
  */

  const loadedPlayers =
    game.players || []


  /*
  =========================================
  FIND THIS PLAYER
  =========================================
  */

  const foundPlayerIndex =
    loadedPlayers.findIndex(
      (player: PlayerData) =>
        player.name
          .trim()
          .toLowerCase() ===
        cleanName
    )


  if (foundPlayerIndex === -1) {

    alert(
      `❌ Player "${playerName}" was not found in this game.\n\n` +
      `Make sure you enter the same name that was registered when the game was created.`
    )

    return
  }


  /*
  =========================================
  LOAD GAME
  =========================================
  */

  setGameId(
    game.game_id
  )

  setPlayers(
    loadedPlayers.length || 1
  )

  setPlayerNames(
    loadedPlayers.map(
      (player: PlayerData) =>
        player.name
    )
  )

  setPlayerData(
    loadedPlayers
  )

  setCurrentPlayer(
    foundPlayerIndex
  )

  setRound(
    game.round || 1
  )

  setPointMode(
    game.mode || 'solo'
  )

  setScreen('board')


  /*
  =========================================
  SUCCESS
  =========================================
  */

  alert(
    `✅ Welcome to the game!\n\n` +
    `👤 Player: ${loadedPlayers[foundPlayerIndex].name}\n` +
    `🆔 Player ID: ${loadedPlayers[foundPlayerIndex].playerId}\n\n` +
    `🎮 Game ID: ${game.game_id}\n` +
    `🔄 Round: ${game.round || 1}`
  )
}
  /*
  =========================================
  FIND CARD NUMBER
  =========================================
  */

  function getCardNumber(
    position: number,
    type: CardType
  ) {
    let number = 0

    for (
      let i = 0;
      i <= position;
      i++
    ) {
      if (
        board[i].type === type
      ) {
        number++
      }
    }

    return number
  }

 /*
=========================================
GET QUESTION
=========================================
*/

/*
=========================================
RANDOM QUESTION BY ROUND
=========================================
*/

function getRandomQuestionForCard(
  type: 'A' | 'G' | 'D'
) {
  let questions: Question[] = []

  if (type === 'A') {
    questions = attractionQuestions
  }

  if (type === 'G') {
    questions = challengeQuestions
  }

  if (type === 'D') {
    questions = discoveryQuestions
  }

  if (questions.length === 0) {
    return null
  }

  /*
  =========================================
  ROUND → DIFFICULTY
  =========================================

  Round 1–4   = Easy
  Round 5–10  = Medium
  Round 11–14 = Hard
  Round 15+   = Extreme
  =========================================
  */

  let difficulty:
    | 'Easy'
    | 'Medium'
    | 'Hard'
    | 'Extreme'

  if (round <= 4) {
    difficulty = 'Easy'
  } else if (round <= 10) {
    difficulty = 'Medium'
  } else if (round <= 14) {
    difficulty = 'Hard'
  } else {
    difficulty = 'Extreme'
  }

  /*
  =========================================
  FIND QUESTIONS FOR THIS DIFFICULTY
  =========================================
  */

  const levelQuestions =
    questions.filter(
      question =>
        question.difficulty === difficulty
    )

  /*
  =========================================
  RANDOM QUESTION
  =========================================
  */

  const availableQuestions =
    levelQuestions.length > 0
      ? levelQuestions
      : questions

  const randomIndex =
    Math.floor(
      Math.random() *
      availableQuestions.length
    )

  return availableQuestions[
    randomIndex
  ]
}

  /*
=========================================
CHOOSE LANDED CARD
=========================================
*/

function chooseLandedCard(
  type: CardType,
  scannedNumber?: number
) {
  const player = playerData[currentPlayer]

  if (!player) {
    alert('⚠️ Player data could not be found.')
    return
  }
  /*
  =========================================
  CARD NUMBER
  =========================================
  */

 const number =
  scannedNumber ??
  getCardNumber(
    player.position,
    type
  )

setCardNumber(number)
setSelectedCard(type)
setAnswer('')
  
  /*
  =========================================
  ATTRACTION
  =========================================
  */

  if (qrCardType === 'A') { 

    const question =
      getRandomQuestionForCard('A')
  
    if (!question) {
      alert(
        '⚠️ No Attraction question found.'
      )
      return
    }
  
    setCurrentQuestion(question)
    setTimeLeft(question.time)
    setScreen('question')
  
    return
  }

  /*
  =========================================
  CHALLENGE
  =========================================
  */

  if (qrCardType === 'G') {
    const question =
      getRandomQuestionForCard('G')
  
    if (!question) {
      alert(
        '⚠️ No Challenge question found.'
      )
      return
    }
  
    setCurrentQuestion(question)
    setTimeLeft(question.time)
    setScreen('challenge')
  
    return
  }

  /*
  =========================================
  DISCOVERY
  =========================================
  */

  if (qrCardType === 'D') {

    const question =
      getRandomQuestionForCard('D')
  
    if (!question) {
      alert(
        '⚠️ No Discovery question found.'
      )
      return
    }
  
    setCurrentQuestion(question)
    setTimeLeft(question.time)
    setScreen('discovery')
  
    return
  }

 /*
=========================================
CHANCE
=========================================
*/

if (qrCardType === 'C') {
  showChanceCard()
  return
}

/*
=========================================
PENALTY
=========================================
*/

if (qrCardType === 'P') {
  showPenaltyCard()
  return
}
 }
  /*
  =========================================
  CHECK ANSWERS
  =========================================
  */

  function calculateCorrectAnswers(
    playerAnswer: string,
    question: Question
  ) {
    const answers =
      playerAnswer
        .toLowerCase()
        .split(/[,;\n]+/)
        .map(item =>
          item
            .trim()
            .replace(/[.!?]/g, '')
        )
        .filter(Boolean)

    let correct = 0

    const alreadyUsed: string[] = []

    answers.forEach(
      answer => {
        const matchingAnswer =
          question.answers.find(
            correctAnswer => {
              const cleanCorrect =
                correctAnswer
                  .toLowerCase()
                  .trim()

              return (
                !alreadyUsed.includes(
                  cleanCorrect
                ) &&
                (
                  answer ===
                    cleanCorrect ||
                  answer.includes(
                    cleanCorrect
                  ) ||
                  cleanCorrect.includes(
                    answer
                  )
                )
              )
            }
          )

        if (matchingAnswer) {
          correct++

          alreadyUsed.push(
            matchingAnswer
              .toLowerCase()
              .trim()
          )
        }
      }
    )

    return Math.min(
      correct,
      question.required
    )
  }

  /*
  =========================================
  ADD POINTS
  =========================================
  */

  async function addPoints(amount: number) {
    const updatedPlayerData = [...playerData]
  
    updatedPlayerData[currentPlayer] = {
      ...updatedPlayerData[currentPlayer],
      points:
        updatedPlayerData[currentPlayer].points +
        amount
    }
  
    setPlayerData(updatedPlayerData)
  
    await saveGameToSupabase(
      gameId,
      pointMode,
      updatedPlayerData,
      round
    )
  }
  /*
  =========================================
  SUBMIT QUESTION
  =========================================
  */

  function submitQuestion() {
    if (!currentQuestion) {
      return
    }

    const correctCount =
      calculateCorrectAnswers(
        answer,
        currentQuestion
      )

      const questionPoints =
  getLevelPoints(currentQuestion.level)

const pointsPerAnswer =
  questionPoints /
  currentQuestion.required

    const earnedPoints =
      Math.round(
        correctCount *
        pointsPerAnswer
      )

    if (
      correctCount === 0
    ) {
      alert(
        `❌ No correct answers.\n\n` +
        `+0 points\n\n` +
        `💡 ${currentQuestion.information}`
      )
    } else {
      addPoints(
        earnedPoints
      )

      alert(
        `🎉 ${correctCount}/${currentQuestion.required} correct!\n\n` +
        `+${earnedPoints} points\n\n` +
        `💡 ${currentQuestion.information}`
      )
    }

    finishCard()
  }

  /*
  =========================================
  TIME UP
  =========================================
  */

  function handleTimeUp() {
    if (!currentQuestion) {
      finishCard()
      return
    }

    const correctCount =
      calculateCorrectAnswers(
        answer,
        currentQuestion
      )

      const pointsPerAnswer =
      currentQuestion.points /
      currentQuestion.required

    const earnedPoints =
      Math.round(
        correctCount *
        pointsPerAnswer
      )

    if (
      correctCount > 0
    ) {
      addPoints(
        earnedPoints
      )

      alert(
        `⏰ Time is up!\n\n` +
        `${correctCount}/${currentQuestion.required} correct.\n\n` +
        `+${earnedPoints} points`
      )
    } else {
      alert(
        `⏰ Time is up!\n\n` +
        `No correct answers.\n\n` +
        `+0 points`
      )
    }

    finishCard()
  }

  /*
=========================================
FINISH CARD
=========================================
*/

function finishCard() {
  setAnswer('')
  setCurrentQuestion(null)
  setSelectedCard(null)
  setTimeLeft(0)

  if (players > 1) {
    setCurrentPlayer(previous => {
      return (previous + 1) % players
    })
  }

  setScreen('board')
}

  /*
  =========================================
  CHANCE CARDS
  =========================================
  */

  function showChanceCard() {
    const chanceCards = [
      {
        text:
          'You receive a complimentary welcome drink.',
        points: 10
      },
      {
        text:
          'You have a smooth hotel experience. Move forward 2 spaces.',
        points: 0
      },
      {
        text:
          'The hotel gives you a complimentary upgrade. Move forward 2 spaces.',
        points: 0
      },
      {
        text:
          'You treat hotel staff with respect.',
        points: 5
      },
      {
        text:
          'You successfully save water during your stay.',
        points: 10
      },
      {
        text:
          'You help another guest find a hotel facility.',
        points: 15
      },
      {
        text:
          'You recommend a local attraction to another guest.',
        points: 10
      },
      {
        text:
          'The hotel provides you with excellent service.',
        points: 10
      },
      {
        text:
          'You help keep the hotel environment clean.',
        points: 5
      },
      {
        text:
          'You learn something interesting about Melaka.',
        points: 5
      },
      {
        text:
          'You give helpful information to another guest. Move forward 2 spaces.',
        points: 0
      },
      {
        text:
          'You have a wonderful stay at Casa del Rio Melaka. Receive bonus points!',
        points: 15
      }
    ]

    const card =
      chanceCards[
        Math.floor(
          Math.random() *
          chanceCards.length
        )
      ]

    if (card.points > 0) {
      addPoints(
        card.points
      )

      alert(
        `🎲 CHANCE!\n\n` +
        `${card.text}\n\n` +
        `+${card.points} points`
      )
    } else {
      alert(
        `🎲 CHANCE!\n\n` +
        `${card.text}`
      )
    }

    finishCard()
  }

  /*
  =========================================
  PENALTY CARDS
  =========================================
  */

  function showPenaltyCard() {
    const penaltyCards = [
      {
        text:
          'UNLUCKY! Move backward by the number you roll.',
        points: -2,
        moveBackward: true
      },
      {
        text:
          'SKIP TURN! Skip your next turn.',
        points: -2,
        moveBackward: false
      },
      {
        text:
          'LOSE POINT! Name one local food and lose 5 points.',
        points: -5,
        moveBackward: false
      },
      {
        text:
          'UNLUCKY! Name 2 nearby attractions and lose 2 points.',
        points: -2,
        moveBackward: false
      },
      {
        text:
          'LATE ARRIVAL! Lose 5 points.',
        points: -5,
        moveBackward: false
      },
      {
        text:
          'PENALTY! Lose 10 points.',
        points: -10,
        moveBackward: false
      },
      {
        text:
          'ROOM NOT READY! Lose 3 points.',
        points: -3,
        moveBackward: false
      },
      {
        text:
          'YOU FORGOT YOUR ROOM KEY! Lose 4 points.',
        points: -4,
        moveBackward: false
      },
      {
        text:
          'LATE CHECK-IN! Lose 5 points.',
        points: -5,
        moveBackward: false
      },
      {
        text:
          'YOU LEFT YOUR ROOM MESSY! Lose 3 points.',
        points: -3,
        moveBackward: false
      },
      {
        text:
          'UNLUCKY! Move backward 2 spaces.',
        points: -2,
        moveBackward: true
      },
      {
        text:
          'BAD LUCK! Lose 8 points.',
        points: -8,
        moveBackward: false
      }
    ]

    const card =
      penaltyCards[
        Math.floor(
          Math.random() *
          penaltyCards.length
        )
      ]

    addPoints(
      card.points
    )

    if (
      !card.moveBackward
    ) {
      alert(
        `⚠️ PENALTY!\n\n` +
        `${card.text}\n\n` +
        `${card.points} points`
      )

      finishCard()

      return
    }

    const dice = prompt(
      '🎲 UNLUCKY!\n\nEnter the number you rolled (1-6):'
    )

    if (!dice) return

    const steps =
      Number(dice)

    if (
      !steps ||
      steps < 1 ||
      steps > 6
    ) {
      alert(
        '⚠️ Please enter a number from 1 to 6.'
      )
      return
    }

    const player =
      playerData[currentPlayer]

    if (!player) return

    let newPosition =
      player.position -
      steps

    if (
      newPosition < 0
    ) {
      newPosition =
        board.length +
        newPosition
    }

    setPlayerData(
      previous => {
        const updated = [
          ...previous
        ]

        updated[currentPlayer] = {
          ...updated[currentPlayer],
          position:
            newPosition
        }

        return updated
      }
    )

    alert(
      `⚠️ PENALTY!\n\n` +
      `${card.text}\n\n` +
      `${card.points} points\n\n` +
      `↩️ Moved backward ${steps} spaces.\n\n` +
      `📍 Position ${newPosition}.\n` +
      `🏨 ${board[newPosition].name}`
    )

    setTimeout(() => {
      const landedType =
        board[newPosition].type

      if (landedType) {
        chooseLandedCard(
          landedType
        )
      } else {
        finishCard()
      }
    }, 100)
  }

  /*
  =========================================
  CURRENT PLAYER
  =========================================
  */

  const currentPlayerInfo =
    playerData[
      currentPlayer
    ]

  /*
  =========================================
  HOME
  =========================================
  */

  if (
    screen === 'home'
  ) {
    return (
      <div className="home">
        <div className="hotel-card">

          <div className="hotel-icon">
            🏨
          </div>

          <h1>
            Hotel Discovery Quest
          </h1>

          <p>
            Welcome to Casa del Rio!
          </p>

          <button
            onClick={() => {
              setHasPlayedBefore(null)
              setScreen('setup')
            }}
          >
            🎲 New Game
          </button>

          <button
  onClick={() =>
    setShowContinueChoice(true)
  }
>
  ▶️ Continue Game
</button>

    {showContinueChoice && (
  <div className="hotel-card">
    <h2>▶️ Continue Game</h2>

    <p>Choose your game type:</p>

    <button
      onClick={() => {
        setPointMode('solo')
        setShowContinueChoice(false)

        setTimeout(() => {
          continueGame()
        }, 0)
      }}
    >
      👤 Continue Solo Game
    </button>

    <button
      onClick={() => {
        setPointMode('group')
        setShowContinueChoice(false)

        setTimeout(() => {
          continueGame()
        }, 0)
      }}
    >
      👥 Continue Group Game
    </button>

    <button
      onClick={() =>
        setShowContinueChoice(false)
      }
    >
      ❌ Cancel
    </button>
  </div>
)}


        </div>
      </div>
    )
  }

  /*
  =========================================
  SETUP
  =========================================
  */

  if (
    screen === 'setup'
  ) {

    if (
      hasPlayedBefore === null
    ) {
      return (
        <div className="home">
          <div className="hotel-card">

            <h1>
              🎲 New Game
            </h1>

            <h2>
              Have you played
              Hotel Discovery Quest before?
            </h2>

            <button
              onClick={() =>
                setHasPlayedBefore(true)
              }
            >
              ✅ Yes, I have played before
            </button>

            <button
              onClick={() =>
                setHasPlayedBefore(false)
              }
            >
              🆕 No, this is my first time
            </button>

            <button
              onClick={() =>
                setScreen('home')
              }
            >
              ← Back
            </button>

          </div>
        </div>
      )
    }

    return (
      <div className="home">
        <div className="hotel-card">

          <h1>
            🎲 New Game
          </h1>

          <p>
            {hasPlayedBefore
              ? '👋 Welcome back!'
              : '🆕 Welcome! Please enter your player names.'}
          </p>

          <hr />

          <h3>
            Number of Players
          </h3>

          <select
            value={players}
            onChange={e =>
              choosePlayers(
                Number(e.target.value)
              )
            }
          >
            <option value={1}>
              👤 Solo Player
            </option>

            <option value={2}>
              👥 2 Players
            </option>

            <option value={3}>
              👥 3 Players
            </option>

            <option value={4}>
              👥 4 Players
            </option>
          </select>

          <h2>
  ⭐ Point Mode
</h2>

<p>
  Choose how points are collected.
</p>

<select
  value={pointMode}
  onChange={e =>
    setPointMode(
      e.target.value as PointMode
    )
  }
>
  <option value="solo">
    👤 Solo Points
  </option>

  <option value="group">
    👥 Group Points
  </option>
</select>

<p>
  {pointMode === 'solo'
    ? 'Each player keeps their own points.'
    : 'All players share one combined point total.'}
</p>

<hr />
          <h2>
            Player Names
          </h2>

          {playerNames.map(
            (
              name,
              index
            ) => (
              <input
                key={index}
                type="text"
                value={name}
                placeholder={
                  `Player ${index + 1} name`
                }
                onChange={e =>
                  updateName(
                    index,
                    e.target.value
                  )
                }
              />
            )
          )}

          <button
            onClick={
              startGame
            }
          >
            🚀 Start Game
          </button>

          <button
            onClick={() =>
              setHasPlayedBefore(null)
            }
          >
            ← Back
          </button>

        </div>
      </div>
    )
  }

  /*
  =========================================
  BOARD
  =========================================
  */

  if (
    screen === 'board'
  ) {
    const position =
      currentPlayerInfo
        ?.position || 0

    const currentSpace =
      board[position]

    return (
      <div className="home">
        <div className="hotel-card">

          <h1>
            🎲 Your Turn
          </h1>

          <h2>
            Round {round}
          </h2>

          <h3>
            👤 {
              currentPlayerInfo
                ?.name ||
              `Player ${currentPlayer + 1}`
            }
          </h3>

          <p>
            🆔 Player ID:{' '}
            {currentPlayerInfo?.playerId}
          </p>

          <div
  style={{
    backgroundColor: '#fff3cd',
    color: '#000',
    padding: '15px',
    borderRadius: '12px',
    marginTop: '10px',
    marginBottom: '15px',
    border: '2px solid #ffc107'
  }}
>
  <h3>🎮 Game ID</h3>

  <h2>
    {gameId}
  </h2>

  <p>
    ⚠️ Keep this Game ID as a backup.
  </p>

  <button
    onClick={() => {
      navigator.clipboard.writeText(gameId)

      alert(
        `✅ Game ID copied!\n\n` +
        `${gameId}\n\n` +
        `Keep it somewhere safe.`
      )
    }}
  >
    📋 Copy Game ID
  </button>
</div>

          <p>
  ⭐ Points:{' '}

  {pointMode === 'group'
    ? playerData.reduce(
        (total, player) =>
          total + player.points,
        0
      )
    : currentPlayerInfo?.points || 0}
</p>

          <hr />

          <h3>
            Your current board position:
          </h3>

          <h1>
            {position}
          </h1>

          <h2>
  {currentSpace.name}
</h2>

<div
  style={{
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#ffffff',
    color: '#000000',
    borderRadius: '15px',
    border: '3px solid #000000'
  }}
>
  <h2>📷 QR SCANNER TEST</h2>

  <button
    onClick={() => setShowScanner(true)}
  >
    📷 Scan Card QR Code
  </button>

  {showScanner && (
    <div
      style={{
        marginTop: '20px'
      }}
    >
      <h3>📷 Camera Scanner</h3>

      <div
        id="qr-reader"
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: 'auto'
        }}
      ></div>

      <button
        onClick={() => setShowScanner(false)}
      >
        ❌ Close Scanner
      </button>
    </div>
  )}
</div>

<hr />
          
      </div>
    </div>
  )
}

  /*
  =========================================
  QUESTION SCREEN
  =========================================
  */

  if (
    screen === 'question' ||
    screen === 'challenge' ||
    screen === 'discovery'
  ) {
    if (!currentQuestion) {
      return null
    }

    let title = ''

    if (
      screen === 'question'
    ) {
      title = '🗺️ Attraction'
    }

    if (
      screen === 'challenge'
    ) {
      title = '🎯 Challenge'
    }

    if (
      screen === 'discovery'
    ) {
      title = '🔎 Discovery'
    }

    return (
      <div className="home">
        <div className="hotel-card">

          <h1>
            {title}
          </h1>

          <p>
            👤 Player:{' '}
            {currentPlayerInfo?.name}
          </p>

          <p>
            🆔 Player ID:{' '}
            {currentPlayerInfo?.playerId}
          </p>

          <p>
            🎮 Game ID: {gameId}
          </p>
          <p>
  ⭐ Point Mode:{' '}
  {pointMode === 'group'
    ? '👥 Group'
    : '👤 Solo'}
</p>

          <p>
            Round {round}
          </p>

          <p>
            Card {cardNumber}
          </p>

          <h2>
            {currentQuestion.question}
          </h2>

          <h3>
            ⏱️ Time Left:{' '}
            {timeLeft} seconds
          </h3>

          <p>
            You need{' '}
            {currentQuestion.required}{' '}
            correct answer
            {currentQuestion.required > 1
              ? 's'
              : ''}.
          </p>

          <p>
            Separate multiple answers
            with commas.
          </p>

          <textarea
            value={answer}
            onChange={e =>
              setAnswer(
                e.target.value
              )
            }
            placeholder="Example: A Famosa, Jonker Street, Christ Church"
            rows={5}
          />

          <button
            onClick={
              submitQuestion
            }
          >
            ✅ Submit Answer
          </button>

          <p>
            ⭐ Current Points:{' '}
            {currentPlayerInfo
              ?.points || 0}
          </p>

        </div>
      </div>
    )
  }


  if (screen === 'reward') {

    const totalPoints =
      pointMode === 'group'
        ? playerData.reduce(
            (total, player) =>
              total + player.points,
            0
          )
        : currentPlayerInfo?.points || 0
  
    const availableRewards =
      REWARDS.filter(
        reward =>
          totalPoints >= reward.points
      )
  
    const nextReward =
      REWARDS.find(
        reward =>
          totalPoints < reward.points
      )
  
    return (
      <div className="home">
  
        <div className="hotel-card">
  
          <h1>
            🎁 Rewards
          </h1>
  
          <hr />
  
          <h2>
            ⭐ Your Points
          </h2>
  
          <h1>
            {totalPoints}
          </h1>
  
          {availableRewards.length > 0 ? (
            <>
              <h2>
                🎉 Rewards Unlocked!
              </h2>
  
              {availableRewards.map(
                reward => (
                  <div key={reward.id}>
  
                    <h3>
                      🎁 {reward.name}
                    </h3>
  
                    <p>
                      ⭐ Required Points:{' '}
                      {reward.points}
                    </p>
  
                    <p>
                      {reward.description}
                    </p>
  
                    <hr />
  
                  </div>
                )
              )}
            </>
          ) : (
            <>
              <h2>
                🎯 Keep Playing!
              </h2>
  
              {nextReward && (
                <p>
                  You need{' '}
                  {nextReward.points -
                    totalPoints}{' '}
                  more points to unlock{' '}
                  <strong>
                    {nextReward.name}
                  </strong>.
                </p>
              )}
            </>
          )}
  
          <button
            onClick={() =>
              setScreen('home')
            }
          >
            🏠 Back to Home
          </button>
  
        </div>
  
      </div>
    )
  }

  return null
}

export default App
