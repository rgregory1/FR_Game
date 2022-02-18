function returnHand(color = 'Pink', rider = 'Roller') {
  let status = findLastMove(color)

  let energyDeck, hand, deckIndex 

  status['deck'].forEach((deck, i) =>{
    if (deck.name == rider){
      energyDeck = deck.energyDeck
      deckIndex = i
    }
  })

  // grab four cards if there are four cards
  if(energyDeck.length >= 4){
    hand = {rider: rider, hand: energyDeck.splice(0,4).sort()}
  } else if (energyDeck.length == 0 && status.deck[deckIndex].recycle.length == 0){
    hand = {rider: rider, hand: ['2E']}
  } else if (status.deck[deckIndex].recycle.length == 0 && energyDeck.length > 0){
    hand = {rider: rider, hand: [...energyDeck].sort()}
    energyDeck = []
  }  else {

    // grab what is in the energy deck
    let currentHandLength = energyDeck.length
    let currentHand = energyDeck.splice(0,currentHandLength)
   
    // shuffle and move recycle to energy
    energyDeck = shuffleDeck(status.deck[deckIndex].recycle)
    status.deck[deckIndex].recycle = []

    // add remaining of 4 cards to hand
    let remainingCurrentHand = energyDeck.splice(0,4-currentHandLength)

    hand = {rider: rider, hand: [...currentHand, ...remainingCurrentHand].sort()}
  }


  console.log("hand", hand)
  console.log('energyDeck', energyDeck)

  // update hand and energy deck
  status.hand = hand
  status.deck[deckIndex].energyDeck = energyDeck
    

  // return hand to page
  updatePlayerTurn(color, status)

  return hand // {rider: rider, hand: hand}
}



function resetForNewTurn(teamColor='Blue'){

  let currentData = findLastMove(teamColor)

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


function getDecksforDisplay(teamColor="Blue"){

  let currentTurnData = findLastMove(teamColor)

  let deckDisplay = {
    decks: currentTurnData.deck,
    choice: currentTurnData.choice
  }
  // let decks = currentTurnData.deck

  deckDisplay.decks[0].energyDeck.sort()
  deckDisplay.decks[0].recycle.sort()
  deckDisplay.decks[0].discard.sort()
  deckDisplay.decks[1].energyDeck.sort()
  deckDisplay.decks[1].recycle.sort()
  deckDisplay.decks[1].discard.sort()

  console.log(deckDisplay.decks)

  // return decks
  return deckDisplay

}





	// { team: 'Green',
  // turn: 0,
  // phase: 0,
  // hand: '',
  // choice: '',
  // deck: 
  //  [ { name: 'Roller', energyDeck: [Object], hand: [], discard: [] },
  //    { name: 'Sprinter', energyDeck: [Object], hand: [], discard: [] } ] }












