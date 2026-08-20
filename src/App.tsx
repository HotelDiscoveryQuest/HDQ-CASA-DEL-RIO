CAMERA QR SCANNER
=========================================
*/

useEffect(() => {
if (!showScanner) return

@@ -1007,22 +1006,21 @@ useEffect(() => {
{ facingMode: 'environment' },
{
fps: 10,
      qrbox: {
        width: 250,
        height: 250
      }
      qrbox: { width: 250, height: 250 }
},
async (decodedText) => {
      console.log(
        'QR SCANNED:',
        decodedText
      )
      console.log('QR SCANNED:', decodedText)

let cardId: string | null = null

/*
     =========================================
      FORMAT 1 — HDQ:A1
      FORMAT 1
      HDQ:A1
      HDQ:G1
      HDQ:D1
      HDQ:C1
      HDQ:P1
     =========================================
     */

@@ -1041,7 +1039,11 @@ useEffect(() => {

/*
     =========================================
      FORMAT 2 — URL ?card=A1
      FORMAT 2
      FULL URL

      Example:
      https://yourwebsite.com/?card=A1
     =========================================
     */

@@ -1064,163 +1066,6 @@ useEffect(() => {
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
      SAVE SCANNED CARD
      =========================================
      */

      setQrCardType(cardType)
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
      ATTRACTION / CHALLENGE / DISCOVERY
      =========================================
      */

      if (
        cardType === 'A' ||
        cardType === 'G' ||
        cardType === 'D'
      ) {
        const question =
          getRandomQuestionForCard(
            cardType
          )

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
      CHANCE
      =========================================
      */

      if (cardType === 'C') {
        showChanceCard()
        return
      }

      /*
      =========================================
      PENALTY
      =========================================
      */

      if (cardType === 'P') {
        showPenaltyCard()
        return
      }
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
@@ -1241,6 +1086,21 @@ if (!cardId) {
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
@@ -1275,77 +1135,6 @@ console.log(
cardNumber
)

setCardNumber(cardNumber)
setSelectedCard(cardType)
setAnswer('')
setQrCardType(cardType)

await scanner.stop()

setShowScanner(false)

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

if (cardType === 'C') {
  showChanceCard()
  return
}

if (cardType === 'P') {
  showPenaltyCard()
  return
}

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
CARD SCANNED SUCCESSFULLY
@@ -2224,6 +2013,28 @@ setAnswer('')
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
