function returnHand(team = "Black", rider = "Roller") {
  let status = getLastMove(team);

  let hand;

  // find deck for rider and assign energydeck from that rider's deck
  let di = status.deck.findIndex((x) => x.name == rider);
  let energyDeck = status.deck[di].energyDeck;

  // remove if code still works
  // status["deck"].forEach((deck, i) => {
  //   if (deck.name == rider) {
  //     energyDeck = deck.energyDeck;
  //     di = i;
  //   }
  // });

  // grab four cards if there are four cards
  if (energyDeck.length >= 4) {
    hand = { rider: rider, hand: energyDeck.splice(0, 4).sort() };
  } else if (energyDeck.length == 0 && status.deck[di].recycle.length == 0) {
    hand = { rider: rider, hand: ["2E"] };
  } else if (status.deck[di].recycle.length == 0 && energyDeck.length > 0) {
    hand = { rider: rider, hand: [...energyDeck].sort() };
    energyDeck = [];
  } else {
    // grab what is in the energy deck
    let currentHandLength = energyDeck.length;
    let currentHand = energyDeck.splice(0, currentHandLength);

    // shuffle and move recycle to energy
    energyDeck = shuffleDeck(status.deck[di].recycle);
    status.deck[di].recycle = [];

    // add remaining of 4 cards to hand
    let remainingCurrentHand = energyDeck.splice(0, 4 - currentHandLength);

    hand = {
      rider: rider,
      hand: [...currentHand, ...remainingCurrentHand].sort(),
    };
  }

  // console.log("hand", hand);
  // console.log("energyDeck", energyDeck);

  // update hand and energy deck
  status.hand = hand;
  status.deck[di].energyDeck = energyDeck;

  // return hand to page
  updatePlayerTurn(team, status);

  return hand; // {rider: rider, hand: hand}
}

function resetForNewTurn(team = "Black") {
  let status = getLastMove(team);

  // add choices cards to discard piles
  status.choice.forEach((choice) => {
    status.deck.forEach((deck) => {
      if (choice.rider == deck.name) {
        deck.discard.push(choice.card);
      }
    });
  });

  // clear choice
  status.choice = [];

  // console.log(currentData.deck[0])
  updatePlayerTurn(team, status);
}

function getDecksforDisplay(team = "Black") {
  let status = getLastMove(team);

  let deckDisplay = {
    decks: status.deck,
    choice: status.choice,
  };
  // let decks = currentTurnData.deck

  deckDisplay.decks[0].energyDeck.sort();
  deckDisplay.decks[0].recycle.sort();
  deckDisplay.decks[0].discard.sort();
  deckDisplay.decks[1].energyDeck.sort();
  deckDisplay.decks[1].recycle.sort();
  deckDisplay.decks[1].discard.sort();

  // console.log(deckDisplay.decks);

  // return decks
  return deckDisplay;
}

// { team: 'Green',
// turn: 0,
// phase: 0,
// hand: '',
// choice: '',
// deck:
//  [ { name: 'Roller', energyDeck: [Object], hand: [], discard: [] },
//    { name: 'Sprinter', energyDeck: [Object], hand: [], discard: [] } ] }
