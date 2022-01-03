function returnHand(color = 'Green', rider = 'Roller') {
  let status = findLastMove(color)

  let energyDeck, hand, deckIndex

  status['deck'].forEach((deck, i) =>{
    if (deck.name == rider){
      energyDeck = deck.energyDeck
      deckIndex = i
    }
  })

  if(energyDeck.length >= 4){
    hand = {rider: rider, hand: energyDeck.splice(0,4)}
  }


  console.log("hand", hand)
  console.log('energyDeck', energyDeck)

  // TODO save hand and new energy deck result
  status.hand = hand
  status.phase + rider.toString().charAt(0)


  status.deck[deckIndex].energyDeck = energyDeck

  // return hand to page

  console.log(status.deck[1].energyDeck)
  updatePlayerTurn(color, status)

  return hand // {rider: rider, hand: hand}
}

/**
 * updates the data for current player
 */
function updatePlayerTurn(team='Black', playerData){

   db.appendRow([
    playerData.team,
    playerData.turn,
    playerData.phase,
    JSON.stringify(playerData.hand),
    JSON.stringify(playerData.choice),
    JSON.stringify(playerData.deck)
   ])


}

function resetForNewTurn(teamColor='Blue'){

  let currentData = findLastMove(teamColor)

  // reset phase
  currentData.phase = 0

  // add choices cards to discard piles
  currentData.choice.forEach(choice => {

    currentData.deck.forEach(deck => {
      if (choice.rider == deck.name){
        deck.discard.push(choice.card)
      }
    })
  })

  // clear choice
  currentData.choice = []

  // console.log(currentData.deck[0])
  updatePlayerTurn(teamColor, currentData)
}



	// { team: 'Green',
  // turn: 0,
  // phase: 0,
  // hand: '',
  // choice: '',
  // deck: 
  //  [ { name: 'Roller', energyDeck: [Object], hand: [], discard: [] },
  //    { name: 'Sprinter', energyDeck: [Object], hand: [], discard: [] } ] }