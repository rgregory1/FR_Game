function processBreakAwayWinnerCards(team = 'White', rider = 'Roller'){

  let turnData = findLastMove(team)

  // get deck index
  let di = turnData.deck.findIndex(x => x.name == rider)

  // console.log(turnData.deck[di].energyDeck)
  
  // add picked cards to discard
  let pickedCards = [turnData.choice[0].card,turnData.choice[1].card]
  turnData.deck[di].discard.push(...pickedCards)

  turnData.choice = [{rider: rider, card: '2E'},{rider: rider, card: '2E'}]


  updatePlayerTurn(team, turnData)
  

}

function resetDecksAfterBreakaway(){

  let allMoves = getAllLastMoves()

  allMoves.forEach(player => {

    let breakAwayRider = player.choice[0].rider

    let di = player.deck.findIndex(x => x.name == breakAwayRider)

    // add back in exhaustion or failed bids
    let pickedCards = [player.choice[0].card,player.choice[1].card]

    // combine decks again
    player.deck[di].energyDeck.push(...player.deck[di].recycle,...pickedCards)
    
    // reset recycle and choice
    player.deck[di].recycle = []
    player.choice = []
    player.phase = []
    player.turn = 0
  
    // shuffle decks
    player.deck[di].energyDeck = shuffleDeck(player.deck[di].energyDeck)

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

function getBreakAwaySpots(){

  let breakAwaySpaces = baseGameInfo.getRange('C14').getValue()
  return breakAwaySpaces
}

function setBreakawayCounterToZero(){
  
  // set breakaway to No
  baseGameInfo.getRange('B14').setValue('No')

  // set turn to zero
  baseGameInfo.getRange('B11').setValue(0)

}

function moveWinningBreakawayRider(rider, position, trackData){

  if(trackData === undefined){
    trackData = track.getDataRange().getValues()
  }

  let riderPosition = getRiderXY(rider, trackData)

  // remove rider
  track.getRange(riderPosition.y+1, riderPosition.x+1).setValue('S-')

  // find breakaway space
  let breakawayCell = {}
  trackData.forEach((line, i) =>{
    let foundIt = line.findIndex(x => x.includes('A-' + position))
    if (foundIt !== -1){
      console.log('y: ', i)
      console.log('x: ', foundIt) 
      breakawayCell.x = foundIt
      breakawayCell.y = i
    }
  })

  // add rider to breakaway space
  track.getRange(breakawayCell.y+1, breakawayCell.x+1).setValue('A-' + rider)



}








