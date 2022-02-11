function processBreakAwayWinnerCards(team = 'Pink', rider = 'Roller', cards = ['3R','4R']){

  let turnData = findLastMove(team)

  // get deck index
  let di = turnData.deck.findIndex(x => x.name == rider)

  console.log(turnData.deck[di].energyDeck)

  cards.forEach(card => {
    turnData.deck[di].energyDeck.splice(turnData.deck[di].energyDeck.indexOf(card),1)
  })

  let newCards = ['2E', '2E']

  turnData.deck[di].energyDeck.push(...newCards)

  turnData.deck[di].energyDeck = shuffleDeck(turnData.deck[di].energyDeck)

  console.log(turnData.deck[di].energyDeck)

  updatePlayerTurn(team, turnData)
  

}

function resetDecksAfterBreakaway(){

  let allMoves = findAllLastMoves()

  allMoves.forEach(player => {

    // combine decks again
    player.deck[0].energyDeck.push(...player.deck[0].recycle,...player.deck[0].discard)
    player.deck[1].energyDeck.push(...player.deck[1].recycle,...player.deck[1].discard)

    // reset decks
    player.deck[0].recycle = []
    player.deck[0].discard = []

    // shuffle decks
    player.deck[0].energyDeck = shuffleDeck(player.deck[0].energyDeck)
    player.deck[1].energyDeck = shuffleDeck(player.deck[1].energyDeck)

    updatePlayerTurn(player.team, player)
    
    console.log('all teams reshuffled')
  })
}


function getBreakAwayStatus(){

  let isBreakAway = baseGameInfo.getRange('B14').getValue()
  if(isBreakAway == 'Yes'){
    return true
  } else {
    return false
  }
}












