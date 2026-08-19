import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from './supabase'
import './App.css'

type CardType = 'C' | 'D' | 'G' | 'A' | 'P'

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
  question: string
  options?: string[]
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

  // =========================
  // LEVEL 1 - EASY
  // ABC
  // =========================

  {
    id: 1,
    level: 1,
    question:
      'Which attraction is a famous historical landmark in Melaka?',
    options: [
      'A Famosa',
      'Petronas Twin Towers',
      'Batu Caves'
    ],
    answers: ['A Famosa'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'A Famosa is one of the most famous historical landmarks in Melaka.'
  },

  {
    id: 2,
    level: 1,
    question:
      'Which place is famous for its night market and local food in Melaka?',
    options: [
      'Jonker Street',
      'KLCC',
      'Sunway Lagoon'
    ],
    answers: ['Jonker Street'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Jonker Street is well known for its food, shopping and weekend night market.'
  },

  {
    id: 3,
    level: 1,
    question:
      'Which attraction is located near the Melaka River?',
    options: [
      'Christ Church',
      'Mount Kinabalu',
      'Legoland'
    ],
    answers: ['Christ Church'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Christ Church is located in the historic Dutch Square area near the Melaka River.'
  },

  {
    id: 4,
    level: 1,
    question:
      'Which activity allows tourists to enjoy views of the Melaka River?',
    options: [
      'Melaka River Cruise',
      'Skiing',
      'Scuba diving'
    ],
    answers: ['Melaka River Cruise'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'The Melaka River Cruise allows visitors to enjoy the scenery and landmarks along the river.'
  },

  // =========================
  // LEVEL 2 - MEDIUM
  // ABC
  // =========================

  {
    id: 5,
    level: 2,
    question:
      'Which area is also known as the historic Dutch Square of Melaka?',
    options: [
      'Red Square',
      'Dataran Merdeka',
      'Independence Square'
    ],
    answers: ['Red Square'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Dutch Square is also commonly known as Red Square because of its distinctive red buildings.'
  },

  {
    id: 6,
    level: 2,
    question:
      'Which attraction is located on top of a hill overlooking the historic area of Melaka?',
    options: [
      'St. Paul’s Church',
      'Klebang Beach',
      'Ayer Keroh Zoo'
    ],
    answers: ['St. Paul’s Church'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'St. Paul’s Church is located on St. Paul’s Hill and offers views of the surrounding historic area.'
  },

  {
    id: 7,
    level: 2,
    question:
      'Which attraction is especially popular for learning about Melaka’s maritime history?',
    options: [
      'Maritime Museum',
      'Melaka Zoo',
      'Shopping Mall'
    ],
    answers: ['Maritime Museum'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'The Maritime Museum introduces visitors to Melaka’s important maritime history.'
  },

  {
    id: 8,
    level: 2,
    question:
      'Which attraction is especially suitable for tourists interested in Peranakan heritage?',
    options: [
      'Baba Nyonya Heritage Museum',
      'National Zoo',
      'Petronas Twin Towers'
    ],
    answers: ['Baba Nyonya Heritage Museum'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'The Baba Nyonya Heritage Museum showcases Peranakan culture and heritage.'
  },

  // =========================
  // LEVEL 3 - HARD
  // TYPE ANSWER
  // =========================

  {
    id: 9,
    level: 3,
    question:
      'Name 3 attractions tourists can visit in Melaka.',
    answers: [
      'A Famosa',
      'Jonker Street',
      'Christ Church',
      'St. Paul’s Church',
      'Melaka River Cruise',
      'Dutch Square',
      'Stadthuys',
      'Maritime Museum'
    ],
    points: 10,
    time: 60,
    required: 3,
    information:
      'Melaka offers many historical, cultural and recreational attractions.'
  },

  {
    id: 10,
    level: 3,
    question:
      'Name 3 historical landmarks in Melaka.',
    answers: [
      'A Famosa',
      'Christ Church',
      'St. Paul’s Church',
      'Stadthuys',
      'Dutch Square'
    ],
    points: 10,
    time: 60,
    required: 3,
    information:
      'Melaka is famous for its historical landmarks and heritage buildings.'
  },

  {
    id: 11,
    level: 3,
    question:
      'Name 4 activities tourists can do in Melaka.',
    answers: [
      'shopping',
      'sightseeing',
      'river cruise',
      'eating',
      'food hunting',
      'visit museum',
      'take photos',
      'walking'
    ],
    points: 10,
    time: 60,
    required: 4,
    information:
      'Tourists can enjoy sightseeing, shopping, food, museums and river cruises in Melaka.'
  },

  {
    id: 12,
    level: 3,
    question:
      'Name 5 attractions a first-time visitor should consider visiting in Melaka.',
    answers: [
      'A Famosa',
      'Jonker Street',
      'Christ Church',
      'St. Paul’s Church',
      'Melaka River Cruise',
      'Dutch Square',
      'Stadthuys',
      'Baba Nyonya Heritage Museum',
      'Maritime Museum'
    ],
    points: 10,
    time: 60,
    required: 5,
    information:
      'Melaka has many historical, cultural and recreational attractions for first-time visitors.'
  }
]

 /*
=========================================
CHALLENGE QUESTIONS
=========================================
*/

const challengeQuestions: Question[] = [

  // =========================
  // LEVEL 1 - EASY
  // ABC
  // =========================

  {
    id: 1,
    level: 1,
    question:
      'Which department is mainly responsible for guest check-in and check-out?',
    options: [
      'Front Office',
      'Housekeeping',
      'Engineering'
    ],
    answers: ['Front Office'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'The Front Office handles guest check-in, check-out, reservations and guest services.'
  },

  {
    id: 2,
    level: 1,
    question:
      'Which department is mainly responsible for cleaning guest rooms?',
    options: [
      'Housekeeping',
      'Security',
      'Sales'
    ],
    answers: ['Housekeeping'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Housekeeping is responsible for cleanliness and preparation of guest rooms.'
  },

  {
    id: 3,
    level: 1,
    question:
      'Which service allows guests to order food to their room?',
    options: [
      'Room Service',
      'Laundry Service',
      'Bell Service'
    ],
    answers: ['Room Service'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Room service allows guests to order food and beverages directly to their room.'
  },

  {
    id: 4,
    level: 1,
    question:
      'Which facility is commonly used by guests for exercise?',
    options: [
      'Gym',
      'Laundry Room',
      'Kitchen'
    ],
    answers: ['Gym'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'A hotel gym provides guests with facilities for exercise and fitness.'
  },

  // =========================
  // LEVEL 2 - MEDIUM
  // ABC
  // =========================

  {
    id: 5,
    level: 2,
    question:
      'Which department is responsible for preparing and serving food and beverages?',
    options: [
      'Food and Beverage',
      'Housekeeping',
      'Engineering'
    ],
    answers: ['Food and Beverage'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'The Food and Beverage department manages restaurants, cafés, bars and other F&B services.'
  },

  {
    id: 6,
    level: 2,
    question:
      'Which hotel department is responsible for maintaining equipment and building systems?',
    options: [
      'Engineering',
      'Front Office',
      'Human Resources'
    ],
    answers: ['Engineering'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Engineering maintains hotel equipment, facilities and building systems.'
  },

  {
    id: 7,
    level: 2,
    question:
      'Which service helps guests arrange information, activities or local recommendations?',
    options: [
      'Concierge',
      'Laundry',
      'Kitchen'
    ],
    answers: ['Concierge'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Concierge staff help guests with information, recommendations and arrangements.'
  },

  {
    id: 8,
    level: 2,
    question:
      'Which action is most important for maintaining food safety?',
    options: [
      'Washing hands',
      'Leaving food uncovered',
      'Using dirty equipment'
    ],
    answers: ['Washing hands'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Good personal hygiene, including hand washing, is important for food safety.'
  },

  // =========================
  // LEVEL 3 - HARD
  // TYPE ANSWER
  // =========================

  {
    id: 9,
    level: 3,
    question:
      'Name 3 responsibilities of the housekeeping department.',
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
    time: 60,
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
      'good communication',
      'communication'
    ],
    points: 10,
    time: 60,
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
      'good facilities',
      'personalized service',
      'communication'
    ],
    points: 10,
    time: 60,
    required: 4,
    information:
      'Good service, cleanliness and effective communication can improve guest satisfaction.'
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
      'give information',
      'good communication'
    ],
    points: 10,
    time: 60,
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

  // =========================
  // LEVEL 1 - EASY
  // ABC
  // =========================

  {
    id: 1,
    level: 1,
    question:
      'Which is an example of an F&B service in a hotel?',
    options: [
      'Restaurant',
      'Car Park',
      'Laundry Room'
    ],
    answers: ['Restaurant'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Hotels may provide F&B services such as restaurants, cafés, bars and room service.'
  },

  {
    id: 2,
    level: 1,
    question:
      'Which road is Casa del Rio Melaka located on?',
    options: [
      'Jalan Kota Laksamana',
      'Jalan Bukit Bintang',
      'Jalan Ampang'
    ],
    answers: ['Jalan Kota Laksamana'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Casa del Rio Melaka is located along Jalan Kota Laksamana.'
  },

  {
    id: 3,
    level: 1,
    question:
      'Which equipment is commonly found in a hotel kitchen?',
    options: [
      'Oven',
      'Television',
      'Wardrobe'
    ],
    answers: ['Oven'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Hotel kitchens use equipment such as ovens, refrigerators, freezers and mixers.'
  },

  {
    id: 4,
    level: 1,
    question:
      'Which is a popular local food from Melaka?',
    options: [
      'Chicken Rice Ball',
      'Nasi Lemak Burger',
      'Roti Canai Pizza'
    ],
    answers: ['Chicken Rice Ball'],
    points: 3,
    time: 60,
    required: 1,
    information:
      'Chicken rice balls are one of the popular foods associated with Melaka.'
  },

  // =========================
  // LEVEL 2 - MEDIUM
  // ABC
  // =========================

  {
    id: 5,
    level: 2,
    question:
      'Which hotel service helps guests with local information and arrangements?',
    options: [
      'Concierge',
      'Kitchen',
      'Engineering'
    ],
    answers: ['Concierge'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Concierge staff assist guests with information, recommendations and arrangements.'
  },

  {
    id: 6,
    level: 2,
    question:
      'Which facility is commonly available in a full-service hotel?',
    options: [
      'Swimming Pool',
      'Factory',
      'Farm'
    ],
    answers: ['Swimming Pool'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Swimming pools are common facilities offered by many hotels.'
  },

  {
    id: 7,
    level: 2,
    question:
      'Which department usually interacts directly with guests during check-in?',
    options: [
      'Front Office',
      'Engineering',
      'Purchasing'
    ],
    answers: ['Front Office'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'The Front Office welcomes guests and handles the check-in process.'
  },

  {
    id: 8,
    level: 2,
    question:
      'Which request can a guest normally make at the Front Office?',
    options: [
      'Wake-up Call',
      'Repair a Hotel Elevator',
      'Cook in the Kitchen'
    ],
    answers: ['Wake-up Call'],
    points: 6,
    time: 60,
    required: 1,
    information:
      'Guests can request services such as wake-up calls from the Front Office.'
  },

  // =========================
  // LEVEL 3 - HARD
  // TYPE ANSWER
  // =========================

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
    time: 60,
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
    time: 60,
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
      'wake-up call',
      'housekeeping',
      'bell service'
    ],
    points: 10,
    time: 60,
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
    time: 60,
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
QR CAMERA SCANNER
=========================================
*/

useEffect(() => {

  if (!showScanner) {
    return
  }

  const scanner = new Html5Qrcode('qr-reader')

  scanner.start(
    { facingMode: 'environment' },
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250
      }
    },

    async (decodedText) => {

      console.log('QR SCANNED:', decodedText)

      /*
      =========================================
      GET CARD TYPE FROM QR
      =========================================
      */

      const cleanQR =
        decodedText
          .trim()
          .toUpperCase()

      const scannedType =
        cleanQR.charAt(0) as CardType

      const validCardTypes: CardType[] = [
        'A',
        'G',
        'D',
        'C',
        'P'
      ]

      /*
      =========================================
      CHECK VALID QR
      =========================================
      */

      if (
        !validCardTypes.includes(
          scannedType
        )
      ) {

        alert(
          '❌ Invalid QR Card!\n\n' +
          'Please scan a valid Hotel Discovery Quest card.'
        )

        return
      }

      /*
      =========================================
      SAVE QR TYPE
      =========================================
      */

      setQrCardType(scannedType)

      /*
      =========================================
      STOP CAMERA
      =========================================
      */

      try {
        await scanner.stop()
      } catch (error) {
        console.log(
          'Scanner stop:',
          error
        )
      }

      setShowScanner(false)

      /*
      =========================================
      CHANCE CARD
      =========================================
      */

      if (scannedType === 'C') {

        showChanceCard()

        return
      }

      /*
      =========================================
      PENALTY CARD
      =========================================
      */

      if (scannedType === 'P') {

        showPenaltyCard()

        return
      }

      /*
      =========================================
      GET CURRENT PLAYER
      =========================================
      */

      const player =
        playerData[currentPlayer]

      if (!player) {

        alert(
          '❌ Player information could not be found.'
        )

        return
      }

      /*
      =========================================
      GET CURRENT BOARD SPACE
      =========================================
      */

      const currentSpace =
        board[player.position]

      /*
      =========================================
      CHECK CARD MATCHES BOARD SPACE
      =========================================
      */

      if (
        !currentSpace ||
        currentSpace.type !== scannedType
      ) {

        alert(
          `⚠️ WRONG CARD!\n\n` +
          `You are currently on:\n` +
          `📍 ${currentSpace?.name || 'Unknown'}\n\n` +
          `You scanned:\n` +
          `📷 ${scannedType}\n\n` +
          `Please scan the correct card for this space.`
        )

        return
      }

      /*
      =========================================
      OPEN QUESTION / INSTRUCTION
      =========================================
      */

      chooseLandedCard(
        scannedType
      )
    }
  )

  /*
  =========================================
  CLEAN UP CAMERA
  =========================================
  */

  return () => {

    scanner
      .stop()
      .catch(() => {})

  }

}, [
  showScanner,
  currentPlayer,
  playerData,
  round
])

/*
=========================================
TIME UP
=========================================
*/

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

}, [
  timeLeft,
  screen
])


/*
=========================================
PLAYER SETUP
=========================================
*/

function choosePlayers(
  number: number
) {
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

  setCurrentPlayer(0)
}


/*
=========================================
UPDATE PLAYER NAME
=========================================
*/

function updateName(
  index: number,
  value: string
) {
  const cleanValue =
    value.toLowerCase()

  const names =
    [...playerNames]

  names[index] =
    cleanValue

  setPlayerNames(names)

  const updated =
    [...playerData]

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
  savedGameId: string,
  mode: PointMode,
  savedPlayerData: PlayerData[],
  savedRound: number
) {
  if (!savedGameId) {
    return false
  }

  const { error } =
    await supabase
      .from('games')
      .upsert({
        game_id: savedGameId,
        mode: mode,
        players: savedPlayerData,
        round: savedRound
      })

  if (error) {
    console.error(
      'Could not save game:',
      error
    )

    return false
  }

  console.log(
    '✅ Game saved:',
    savedGameId
  )

  return true
}


/*
=========================================
LOAD SAVED GAME FROM SUPABASE
=========================================
*/

async function loadGameFromSupabase(
  savedGameId: string
) {
  const { data, error } =
    await supabase
      .from('games')
      .select('*')
      .eq(
        'game_id',
        savedGameId
      )
      .single()

  if (error || !data) {
    console.error(
      'Could not load game:',
      error
    )

    alert(
      '❌ Game not found.\n\n' +
      'Please check your Game ID.'
    )

    return false
  }

  setGameId(
    data.game_id
  )

  setPointMode(
    data.mode || 'solo'
  )

  setPlayerData(
    data.players || []
  )

  setPlayers(
    data.players?.length || 1
  )

  setPlayerNames(
    (data.players || []).map(
      (player: PlayerData) =>
        player.name
    )
  )

  setRound(
    data.round || 1
  )

  setCurrentPlayer(0)

  setScreen('board')

  return true
}


/*
=========================================
START NEW GAME
=========================================
*/

async function startGame() {
  console.log(
    'START GAME CLICKED'
  )

  const cleanNames =
    playerNames.map(
      name =>
        name.trim().toLowerCase()
    )

  /*
  =========================================
  CHECK PLAYER NAMES
  =========================================
  */

  if (
    cleanNames.some(
      name => !name
    )
  ) {
    alert(
      '⚠️ Please enter a name for every player.'
    )

    return
  }

  /*
  =========================================
  CHECK DUPLICATE NAMES
  =========================================
  */

  const duplicateNames =
    cleanNames.some(
      (name, index) =>
        cleanNames.findIndex(
          other =>
            other === name
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
  CREATE GAME ID
  =========================================
  */

  const newGameId =
    'HQ-' +
    Math.floor(
      1000 +
      Math.random() * 9000
    )

  /*
  =========================================
  CREATE REWARD CODE
  =========================================
  */

  const newRewardCode =
    generateRewardCode()

  /*
  =========================================
  CREATE PLAYER DATA
  =========================================
  */

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

  /*
  =========================================
  UPDATE STATE
  =========================================
  */

  setGameId(
    newGameId
  )

  setRewardClaimCode(
    newRewardCode
  )

  setRewardClaimed(
    false
  )

  setCurrentPlayer(0)

  setRound(1)

  setPlayerData(
    newPlayerData
  )

  /*
  =========================================
  SAVE LOCAL GAME
  =========================================
  */

  const gameData = {
    gameId: newGameId,
    players,
    playerNames: cleanNames,
    currentPlayer: 0,
    playerData: newPlayerData,
    round: 1,
    pointMode,
    rewardClaimCode:
      newRewardCode,
    rewardClaimed: false
  }

  localStorage.setItem(
    `hotelDiscoveryQuest_${newGameId}`,
    JSON.stringify(gameData)
  )

  /*
  =========================================
  SAVE NAME → GAME ID
  =========================================
  */

  cleanNames.forEach(
    name => {
      localStorage.setItem(
        `hotelDiscoveryQuest_name_${name}`,
        newGameId
      )
    }
  )

  /*
  =========================================
  SAVE TO SUPABASE
  =========================================
  */

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

  /*
  =========================================
  GO TO BOARD
  =========================================
  */

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
  ASK GAME ID
  =========================================
  */

  const enteredGameId =
    prompt(
      '🎮 Enter your Game ID\n\n' +
      'Example: HQ-4821'
    )

  if (!enteredGameId) {
    return
  }

  const cleanGameId =
    enteredGameId
      .trim()
      .toUpperCase()

  /*
  =========================================
  ASK PLAYER NAME
  =========================================
  */

  const enteredName =
    prompt(
      '👤 Enter your player name'
    )

  if (!enteredName) {
    return
  }

  const cleanName =
    enteredName
      .trim()
      .toLowerCase()

  /*
  =========================================
  FIND GAME
  =========================================
  */

  const { data: game, error } =
    await supabase
      .from('games')
      .select('*')
      .eq(
        'game_id',
        cleanGameId
      )
      .single()

  if (error || !game) {
    alert(
      '❌ Game not found.\n\n' +
      'Please check your Game ID.'
    )

    return
  }

  /*
  =========================================
  GET PLAYERS
  =========================================
  */

  const loadedPlayers:
    PlayerData[] =
    game.players || []

  /*
  =========================================
  FIND PLAYER
  =========================================
  */

  const foundPlayerIndex =
    loadedPlayers.findIndex(
      player =>
        player.name
          .trim()
          .toLowerCase() ===
        cleanName
    )

  if (
    foundPlayerIndex === -1
  ) {
    alert(
      `❌ Player "${enteredName}" was not found in this game.\n\n` +
      `Please enter the same player name used when the game was created.`
    )

    return
  }

  /*
  =========================================
  RESTORE GAME
  =========================================
  */

  setGameId(
    game.game_id
  )

  setPlayers(
    loadedPlayers.length
  )

  setPlayerNames(
    loadedPlayers.map(
      player =>
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

  alert(
    `✅ Welcome back!\n\n` +
    `👤 Player: ${loadedPlayers[foundPlayerIndex].name}\n\n` +
    `🆔 Player ID: ${loadedPlayers[foundPlayerIndex].playerId}\n\n` +
    `🎮 Game ID: ${game.game_id}\n\n` +
    `🔄 Round: ${game.round || 1}`
  )
}


/*
=========================================
FIND CARD NUMBER FROM BOARD POSITION
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
GET RANDOM QUESTION FOR CARD
=========================================
*/

function getRandomQuestionForCard(
  type: 'A' | 'G' | 'D'
) {
  let questions: Question[] = []

  /*
  =========================================
  SELECT QUESTION CATEGORY
  =========================================
  */

  if (type === 'A') {
    questions =
      attractionQuestions
  }

  if (type === 'G') {
    questions =
      challengeQuestions
  }

  if (type === 'D') {
    questions =
      discoveryQuestions
  }

  if (
    questions.length === 0
  ) {
    return null
  }

  /*
  =========================================
  ROUND → LEVEL
  =========================================

  Round 1–4  = Level 1
  Round 5–10 = Level 2
  Round 11+  = Level 3
  =========================================
  */

  let level = 1

  if (round <= 4) {
    level = 1
  } else if (round <= 10) {
    level = 2
  } else {
    level = 3
  }

  /*
  =========================================
  CURRENT PLAYER
  =========================================
  */

  const player =
    playerData[currentPlayer]

  if (!player) {
    return null
  }

  /*
  =========================================
  USED QUESTIONS
  =========================================
  */

  const usedQuestions =
    player.usedQuestions[type]

  /*
  =========================================
  QUESTIONS FOR CURRENT LEVEL
  =========================================
  */

  let availableQuestions =
    questions.filter(
      question =>
        question.level === level &&
        !usedQuestions.includes(
          question.id
        )
    )

  /*
  =========================================
  IF CURRENT LEVEL IS EXHAUSTED
  USE ANY UNUSED QUESTION
  =========================================
  */

  if (
    availableQuestions.length === 0
  ) {
    availableQuestions =
      questions.filter(
        question =>
          !usedQuestions.includes(
            question.id
          )
      )
  }

  /*
  =========================================
  IF ALL QUESTIONS ARE USED
  RESET THIS CATEGORY
  =========================================
  */

  if (
    availableQuestions.length === 0
  ) {
    setPlayerData(
      previous => {
        const updated =
          [...previous]

        updated[currentPlayer] = {
          ...updated[currentPlayer],

          usedQuestions: {
            ...updated[currentPlayer]
              .usedQuestions,

            [type]: []
          }
        }

        return updated
      }
    )

    availableQuestions =
      questions.filter(
        question =>
          question.level === level
      )

    /*
    If somehow no question exists
    at this level, use all questions.
    */

    if (
      availableQuestions.length === 0
    ) {
      availableQuestions =
        questions
    }
  }

  /*
  =========================================
  SELECT RANDOM QUESTION
  =========================================
  */

  const randomIndex =
    Math.floor(
      Math.random() *
      availableQuestions.length
    )

  const selectedQuestion =
    availableQuestions[
      randomIndex
    ]

  /*
  =========================================
  SAVE QUESTION AS USED
  FOR CURRENT PLAYER
  =========================================
  */

  setPlayerData(
    previous => {
      const updated =
        [...previous]

      const currentUsed =
        updated[currentPlayer]
          .usedQuestions[type]

      /*
      Prevent duplicate ID
      */

      if (
        !currentUsed.includes(
          selectedQuestion.id
        )
      ) {
        updated[currentPlayer] = {
          ...updated[currentPlayer],

          usedQuestions: {
            ...updated[currentPlayer]
              .usedQuestions,

            [type]: [
              ...currentUsed,
              selectedQuestion.id
            ]
          }
        }
      }

      return updated
    }
  )

  return selectedQuestion
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
  const player =
    playerData[currentPlayer]

  if (!player) {
    alert(
      '⚠️ Player data could not be found.'
    )

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

  setQrCardType(type)

  setAnswer('')

  /*
  =========================================
  ATTRACTION
  =========================================
  */

  if (type === 'A') {
    const question =
      getRandomQuestionForCard('A')

    if (!question) {
      alert(
        '⚠️ No Attraction question found.'
      )

      return
    }

    setCurrentQuestion(question)

    setTimeLeft(
      question.time
    )

    setScreen('question')

    return
  }

  /*
  =========================================
  CHALLENGE
  =========================================
  */

  if (type === 'G') {
    const question =
      getRandomQuestionForCard('G')

    if (!question) {
      alert(
        '⚠️ No Challenge question found.'
      )

      return
    }

    setCurrentQuestion(question)

    setTimeLeft(
      question.time
    )

    setScreen('challenge')

    return
  }

  /*
  =========================================
  DISCOVERY
  =========================================
  */

  if (type === 'D') {
    const question =
      getRandomQuestionForCard('D')

    if (!question) {
      alert(
        '⚠️ No Discovery question found.'
      )

      return
    }

    setCurrentQuestion(question)

    setTimeLeft(
      question.time
    )

    setScreen('discovery')

    return
  }

  /*
  =========================================
  CHANCE
  =========================================
  */

  if (type === 'C') {
    showChanceCard()
    return
  }

  /*
  =========================================
  PENALTY
  =========================================
  */

  if (type === 'P') {
    showPenaltyCard()
    return
  }
}


/*
=========================================
CALCULATE CORRECT ANSWERS
=========================================
*/

function calculateCorrectAnswers(
  playerAnswer: string,
  question: Question
) {

  /*
  =========================================
  LEVEL 1 & 2 = ABC
  =========================================
  */

  if (
    question.level <= 2 &&
    question.options
  ) {

    const selected =
      playerAnswer
        .trim()
        .toLowerCase()

    if (!selected) {
      return 0
    }

    const selectedIndex =
      selected.charCodeAt(0) - 97

    if (
      selectedIndex < 0 ||
      selectedIndex >=
        question.options.length
    ) {
      return 0
    }

    const selectedOption =
      question.options[
        selectedIndex
      ]
        .trim()
        .toLowerCase()

    const correct =
      question.answers.some(
        correctAnswer =>
          correctAnswer
            .trim()
            .toLowerCase() ===
          selectedOption
      )

    return correct ? 1 : 0
  }

  /*
  =========================================
  LEVEL 3 = TYPED ANSWER
  =========================================
  */

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

  answers.forEach(answer => {

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
  })

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

async function addPoints(
  amount: number
) {
  const updated =
    [...playerData]

  if (
    !updated[currentPlayer]
  ) {
    return
  }

  /*
  =========================================
  PREVENT POINTS BELOW ZERO
  =========================================
  */

  const newPoints =
    Math.max(
      0,
      updated[currentPlayer].points +
        amount
    )

  updated[currentPlayer] = {
    ...updated[currentPlayer],
    points: newPoints
  }

  setPlayerData(updated)

  /*
  =========================================
  SAVE GAME
  =========================================
  */

  if (gameId) {
    await saveGameToSupabase(
      gameId,
      pointMode,
      updated,
      round
    )
  }
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

  /*
  =========================================
  POINTS BASED ON LEVEL
  =========================================
  */

  const questionPoints =
    getLevelPoints(
      currentQuestion.level
    )

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

  const questionPoints =
    getLevelPoints(
      currentQuestion.level
    )

  const pointsPerAnswer =
    questionPoints /
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
      `+${earnedPoints} points\n\n` +
      `💡 ${currentQuestion.information}`
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

  setQrCardType(null)

  setTimeLeft(0)

  /*
  =========================================
  NEXT PLAYER
  =========================================
  */

  if (players > 1) {
    setCurrentPlayer(
      previous =>
        (previous + 1) % players
    )
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

  if (
    card.points > 0
  ) {
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

  /*
  =========================================
  APPLY PENALTY
  =========================================
  */

  addPoints(
    card.points
  )

  /*
  =========================================
  NORMAL PENALTY
  =========================================
  */

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

  /*
  =========================================
  MOVE BACKWARD
  =========================================
  */

  const dice =
    prompt(
      '🎲 UNLUCKY!\n\n' +
      'Enter the number you rolled (1-6):'
    )

  if (!dice) {
    finishCard()
    return
  }

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

  if (!player) {
    return
  }

  let newPosition =
    player.position -
    steps

  /*
  =========================================
  BOARD WRAP AROUND
  =========================================
  */

  if (
    newPosition < 0
  ) {
    newPosition =
      board.length +
      newPosition
  }

  /*
  =========================================
  UPDATE POSITION
  =========================================
  */

  setPlayerData(
    previous => {
      const updated =
        [...previous]

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
    `📍 Position ${newPosition}\n` +
    `🏨 ${board[newPosition].name}`
  )

  /*
  =========================================
  CHECK NEW SPACE
  =========================================
  */

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
MOVE PLAYER
=========================================
*/

function moveNextSpace(
  steps: number
) {
  const player =
    playerData[currentPlayer]

  if (!player) {
    return
  }

  let newPosition =
    player.position + steps

  /*
  =========================================
  BOARD WRAP AROUND
  =========================================
  */

  if (
    newPosition >= board.length
  ) {
    newPosition =
      newPosition % board.length
  }

  /*
  =========================================
  UPDATE PLAYER POSITION
  =========================================
  */

  setPlayerData(
    previous => {
      const updated =
        [...previous]

      updated[currentPlayer] = {
        ...updated[currentPlayer],
        position:
          newPosition
      }

      return updated
    }
  )

  /*
  =========================================
  SHOW LANDED SPACE
  =========================================
  */

  alert(
    `🎲 You moved ${steps} spaces!\n\n` +
    `📍 Position: ${newPosition}\n` +
    `🏨 ${board[newPosition].name}`
  )

  /*
  =========================================
  CHECK LANDED SPACE
  =========================================
  */

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
HOME SCREEN
=========================================
*/

if (screen === 'home') {
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

            <h2>
              ▶️ Continue Game
            </h2>

            <p>
              Choose your game type:
            </p>

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
SETUP SCREEN
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
              Number(
                e.target.value
              )
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

         {currentQuestion.level <= 2 ? (
  <>
    <p>
      Choose the correct answer:
    </p>

    <div className="answer-options">
      {currentQuestion.options?.map(
        (option, index) => {
          const letter =
            String.fromCharCode(
              97 + index
            )

          return (
            <button
              key={option}
              className={
                answer === letter
                  ? 'selected-answer'
                  : ''
              }
              onClick={() =>
                setAnswer(letter)
              }
            >
              {letter.toUpperCase()}. {option}
            </button>
          )
        }
      )}
    </div>
  </>
) : (
  <>
    <p>
      Type your answer below.
      <br />
      Separate multiple answers
      with commas.
    </p>

    <textarea
      value={answer}
      onChange={e =>
        setAnswer(e.target.value)
      }
      placeholder="Example: A Famosa, Jonker Street, Christ Church"
      rows={5}
    />
  </>
)}

<button
  onClick={
    submitQuestion
  }
>
  ✅ Submit Answer
</button>

<p>
  ⭐ Current Points:{' '}
  {currentPlayerInfo?.points || 0}
</p>

</div>
</div>
)
}

/*
=========================================
BOARD SCREEN
=========================================
*/

if (screen === 'board') {

  const player =
    playerData[currentPlayer]

  const currentSpace =
    player
      ? board[player.position]
      : null

  return (
    <div className="home">

      <div className="hotel-card">

        <h1>
          🏨 Hotel Discovery Quest
        </h1>

        <hr />
    
        {/* PLAYER INFORMATION */}

        <h2>
          👤 {player?.name}
        </h2>

        <p>
          🆔 Player ID:{' '}
          {player?.playerId}
        </p>

        <p>
          🎮 Game ID:{' '}
          {gameId}
        </p>

        <p>
          🔄 Round:{' '}
          {round}
        </p>

        <p>
          ⭐ Points:{' '}
          {player?.points || 0}
        </p>

        <p>
          📍 Current Position:{' '}
          {player?.position}
        </p>

        <p>
          🏨 Current Space:{' '}
          {currentSpace?.name}
        </p>

        <hr />

        {/* SCAN QR */}

        <h2>
          📷 Scan Your Card
        </h2>

        <p>
          Scan the QR code on the physical
          card you landed on.
        </p>

        <button
  onClick={() => setShowScanner(true)}
>
  📷 SCAN QR CARD
</button>

        {/* SCANNER */}

        {showScanner && (

          <div className="hotel-card">

            <h2>
              📷 QR Scanner
            </h2>

            <p>
              Point your camera at the QR
              code on your physical card.
            </p>

            <div
              id="qr-reader"
              style={{
                width: '100%',
                maxWidth: '400px',
                margin: '20px auto'
              }}
            />

            <button
              onClick={() =>
                setShowScanner(false)
              }
            >
              ❌ CLOSE SCANNER
            </button>

          </div>

        )}

        <hr />
        
        {/* SAVE & EXIT */}

        <button
          onClick={async () => {

            if (!gameId) {

              alert(
                '⚠️ Game ID not found.\n\n' +
                'The game cannot be saved.'
              )

              return
            }

            /*
            =========================================
            SAVE CURRENT GAME
            =========================================
            */

            const saved =
              await saveGameToSupabase(
                gameId,
                pointMode,
                playerData,
                round
              )

            if (!saved) {

              alert(
                '❌ Could not save the game.\n\n' +
                'Please try again.'
              )

              return
            }

            /*
            =========================================
            SAVE LOCAL COPY TOO
            =========================================
            */

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

            /*
            =========================================
            EXIT
            =========================================
            */

            alert(
              '💾 GAME SAVED!\n\n' +
              'Your points, positions, round and progress have been saved.\n\n' +
              'You can continue the game later using your Game ID and player name.'
            )

            setShowScanner(false)

            setScreen('home')
          }}
        >
          💾 SAVE & EXIT
        </button>

        <hr />

        {/* REWARDS */}

        <button
          onClick={() =>
            setScreen('reward')
          }
        >
          🎁 REWARDS
        </button>

      </div>

    </div>
  )
}
  
  /*
=========================================
REWARD SCREEN
=========================================
*/

if (screen === 'reward') {

  const totalPoints =
    pointMode === 'group'
      ? playerData.reduce(
          (total, player) =>
            total + player.points,
          0
        )
      : currentPlayerInfo?.points || 0

  /*
  =========================================
  AVAILABLE REWARDS
  =========================================
  */

  const availableRewards =
    REWARDS.filter(
      reward =>
        totalPoints >= reward.points
    )

  /*
  =========================================
  NEXT REWARD
  =========================================
  */

  const nextReward =
    REWARDS
      .slice()
      .sort(
        (a, b) =>
          a.points - b.points
      )
      .find(
        reward =>
          totalPoints < reward.points
      )

  /*
  =========================================
  CLAIM REWARD
  =========================================
  */

  async function claimReward(
    rewardId: string,
    rewardPoints: number
  ) {

    if (
      totalPoints < rewardPoints
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `🎁 Claim this reward?\n\n` +
        `Required points: ${rewardPoints}\n\n` +
        `Your points: ${totalPoints}\n\n` +
        `Your points will be reset to 0 after claiming.`
      )

    if (!confirmed) {
      return
    }

    /*
    =========================================
    SOLO MODE
    =========================================
    */

    if (
      pointMode === 'solo'
    ) {

      const updated =
        [...playerData]

      updated[currentPlayer] = {
        ...updated[currentPlayer],
        points: 0
      }

      setPlayerData(
        updated
      )

      /*
      SAVE GAME
      */

      if (gameId) {
        const saved =
  await saveGameToSupabase(
    gameId,
    pointMode,
    playerData,
    round
  )

if (!saved) {
  alert(
    '❌ Could not save the game.'
  )

  return
}

alert(
  '💾 Game saved successfully!\n\n' +
  'Your points, position, round and progress have been saved.'
)

setScreen('home')

      return
    }

    /*
    =========================================
    GROUP MODE
    =========================================
    */

    if (
      pointMode === 'group'
    ) {

      const updated =
        [...playerData]

      /*
      Reset all shared points
      */

      updated.forEach(
        player => {
          player.points = 0
        }
      )

      setPlayerData(
        updated
      )

      /*
      SAVE GAME
      */

      if (gameId) {
        await saveGameToSupabase(
          gameId,
          pointMode,
          updated,
          round
        )
      }

      alert(
        `🎉 Reward claimed successfully!\n\n` +
        `The shared points have been reset to 0.`
      )

      setScreen('home')

      return
    }
  }

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

        {/* 
=========================================
REWARDS UNLOCKED
=========================================
*/}

        {availableRewards.length > 0 ? (

          <>
            <h2>
              🎉 Rewards Unlocked!
            </h2>

            {availableRewards
              .sort(
                (a, b) =>
                  b.points - a.points
              )
              .map(
                reward => (

                  <div
                    key={reward.id}
                    className="hotel-card"
                  >

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

                    <button
                      onClick={() =>
                        claimReward(
                          reward.id,
                          reward.points
                        )
                      }
                    >
                      🎁 Claim Reward
                    </button>

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
                <strong>
                  {nextReward.points -
                    totalPoints}
                </strong>{' '}
                more points to unlock{' '}
                <strong>
                  {nextReward.name}
                </strong>.
              </p>

            )}

          </>

        )}

        <hr />

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

export default App
