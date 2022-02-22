/**
 * The main gameloop that decides what choices to return to the player's html page
 * @param {string} team - team name to run the loop for
 * @returns {object} - contains string to describe situation and possibly hand
 * to display
 */
function gameLoop(team = "Black") {
  // check for game end
  let isGameOver = getGameOver()
  if (isGameOver) {
    return { type: "gameOver" }
  }

  let status = getLastMove(team)
  let isBreakAway = getBreakAwayStatus()
  let gameTurn = getCurrentGameTurn()

  // check if it's time to choose starting positions
  if (status.turn == -1) {
    console.log("choose starting position")

    let possiblePositions = returnPossiblePositions()

    return { type: "startingPositions", positions: possiblePositions }
  }

  if (status.turn == 0 && gameTurn == -1) {
    return { type: "setupComplete" }
  }

  // check if turn has been played
  if (status.choice.length == 2) {
    gameTurn = getCurrentGameTurn() + 1

    return { type: "turnPlayed", gameTurn: gameTurn }
  }

  // check if player has two riders past finish
  if (status.special.length == 2) {
    gameTurn = getCurrentGameTurn() + 1

    return { type: "finishedPlaying", gameTurn: gameTurn }
  }

  if (status.special.length == 1) {
    let finishedRider = status.special[0].finish

    let inPlayRiderDeck = status.deck.findIndex(x => x.name !== finishedRider)

    let inPlayHand = returnHand(status.team, status.deck[inPlayRiderDeck].name)

    console.log(inPlayHand.hand)

    return {
      type: "deckReturn",
      hand: {
        hand: inPlayHand.hand,
        rider: inPlayHand.rider,
      },
      rider: inPlayHand.rider,
    }
  }

  // if rider has been choose and screen refreshed return previously selected hand
  if (JSON.stringify(status.hand) !== "{}") {
    return {
      type: "deckReturn",
      hand: status.hand,
      rider: status.hand.rider,
    }
  }

  // check if rider hasn't choosen a rider yet
  if (status.choice.length == 0 && JSON.stringify(status.hand) === "{}") {
    return { type: "chooseDeck" }
  }
}

/**
 * handle card chosen, adjust decks and choice, return new hand if necessary
 * or send message that chosing is done
 * @param {string} card
 * @param {string} team
 * @param {string} rider
 * @returns
 */
function sendCardChoice(card = "3R", team = "Black", rider = "Roller") {
  let status = getLastMove(team)
  // console.log(status);

  // move card to choice and rest of hand to recycle
  let cardIndex = status.hand.hand.indexOf(card)
  status.hand.hand.splice(cardIndex, 1)

  if (status.choice) {
    status.choice.push({ rider: rider, card: card })
  } else {
    status.choice = [{ rider: rider, card: card }]
  }

  let di = status.deck.findIndex(x => x.name == rider)

  status.deck[di].recycle = [...status.deck[di].recycle, ...status.hand.hand]
  status.hand = {}

  // check for finished rider
  if (status.special.length > 0) {
    status.choice.push({ rider: status.special[0].finish, card: "F" })
  }

  // increment turn if both cards are choosen
  if (status.choice.length == 2) {
    status.turn = status.turn + 1
  }

  // console.log(status);
  updatePlayerTurn(team, status)

  // if only one car played, return hand for other rider
  if (status.choice.length == 1) {
    let nextRider = status.deck.findIndex(x => x.name !== rider)

    let newHand = returnHand(team, nextRider)

    // console.log("new hand returned: ", newHand);

    return newHand
  } else {
    // console.log("length of choice is 2");
    return "this turn complete"
  }
}

/**
 * increases a teams turn if needed outside of normal flow
 * @param {string} team - team to increment
 */
function increasePlayerGameTurn(team = "Black") {
  let status = getLastMove(team)
  status.turn = status.turn + 1

  updatePlayerTurn(team, status)
}
