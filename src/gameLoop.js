function gameLoop(team = "Green") {

  // check for game end
  let isGameOver = getGameOver()
  if (isGameOver){
    return { type: 'gameOver'}
  }

  let status = findLastMove(team);

  // check if it's time to choose starting positions
  if (status.turn == -1) {
    console.log("choose starting position");

    let possiblePositions = returnPossiblePositions();

    return { type: "startingPositions", positions: possiblePositions };
  }

  // check if rider hasn't choosen a rider yet
  if (status.phase == 0 && JSON.stringify(status.hand) === '{}'){
    return { type: "chooseDeck"};
  }

  // if rider has been choose and screen refreshed return previously selected hand
  if (JSON.stringify(status.hand) !== '{}'){
    return { type: 'deckReturn', hand: status.hand, rider: status.hand.rider}
  }
  
}


function sendCardChoice(card = '6R', teamColor="Blue", rider='Roller'){

  let deckNumber, nextRider

  let data = findLastMove(teamColor)
  console.log(data)

  // move card to choice and rest of hand to recycle
  let cardIndex = data.hand.hand.indexOf(card)
  data.hand.hand.splice(cardIndex,1)

  if (data.choice){
    data.choice.push({rider: rider, card: card})
  } else {
    data.choice = [{rider: rider, card: card}]
  }

  if (rider == 'Roller'){
    deckNumber = 0
  } else deckNumber = 1

  data.deck[deckNumber].recycle = [ ...data.deck[deckNumber].recycle, ...data.hand.hand]
  data.hand = {}
  data.phase = data.phase + 1

  if (data.phase == 2){
    data.turn = data.turn + 1
  }

  console.log(data)
  updatePlayerTurn(teamColor, data)

  if(data.phase == 1){
    console.log('one')
    if(rider == 'Sprinter'){
      nextRider = 'Roller'
    } else {
      nextRider = 'Sprinter'
    }
    let newHand = returnHand(teamColor, nextRider)

    console.log('new hand returned: ', newHand)

    return newHand

  } else {

    console.log('data phase is more than one: ', data.phase)
    return 'this turn complete'
  }


}











