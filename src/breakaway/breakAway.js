/**
 * begin breakaway, set turn for all players and notify to pick first card
 */
function initiateBreakaway() {
  let playerData = getPlayerData();

  let allLastMoves = getAllLastMoves();

  allLastMoves.forEach((status) => {
    status.turn = "B";
    updatePlayerTurn(status.team, status);
  });

  playerData.forEach((player) => {
    let htmlForEmail = `<h3>Time to choose your breakaway Rider</h3>
    
    <a href="${gameApiLink}?color=${player.team}">Click here to begin</a>`;

    MailApp.sendEmail(
      player.email,
      `${player.team} Team - Choose Your Breakaway Rider`,
      "",
      {
        htmlBody: htmlForEmail,
      }
    );
  });
}

/**
 * determins where they are in the breakaway process and returns appropriate
 * results based on status
 * @param {string} team - enter team to check on
 * @returns {object} - hand or choices depending on status
 */
function breakawayLoop(team = "Black") {
  let status = getLastMove(team);

  // check if first choice complete
  if (status.phase[0] == "first round complete") {
    // check if hand already choosen
    if (status.choice.length == 1 && JSON.stringify(status.hand) !== "{}") {
      return {
        type: "deckReturn",
        hand: status.hand,
        rider: status.hand.rider,
      };
    }

    // check if breakaway rider needs a hand to pick from
    if (status.choice.length == 1 && JSON.stringify(status.hand) === "{}") {
      let breakawayRider = status.choice[0].rider;

      let inPlayHand = returnHand(status.team, breakawayRider);

      console.log(inPlayHand.hand);

      return {
        type: "deckReturn",
        hand: {
          hand: inPlayHand.hand,
          rider: inPlayHand.rider,
        },
        rider: inPlayHand.rider,
      };
    }
  }

  // if rider has been choose and screen refreshed return previously selected hand
  if (JSON.stringify(status.hand) !== "{}") {
    return {
      type: "deckReturn",
      hand: status.hand,
      rider: status.hand.rider,
    };
  }

  // check if rider hasn't choosen a rider yet
  if (status.choice.length == 0 && JSON.stringify(status.hand) === "{}") {
    return { type: "chooseDeck" };
  }
}

/**
 * returns hand back to webpage with card choices
 * @param {string} team - team to use
 * @param {string} rider - particular rider to get cards for
 * @returns {object} hand - specific hand of cards from DB
 */
function returnBreakawayHand(team = "Black", rider = "Roller") {
  let status = getLastMove(team);

  // find deck for rider and assign energydeck from that rider's deck
  let di = status.deck.findIndex((x) => x.name == rider);
  let energyDeck = status.deck[di].energyDeck;

  // grab four cards
  let hand = { rider: rider, hand: energyDeck.splice(0, 4).sort() };

  // console.log("hand", hand);
  // console.log("energyDeck", energyDeck);

  // update hand and energy deck
  status.hand = hand;
  status.deck[di].energyDeck = energyDeck;

  // return hand to page
  updatePlayerTurn(team, status);

  return hand; // {rider: rider, hand: hand}
}

/**
 * add chosen card to choice and then begins check for end of breakaway
 * @param {string} card - specific card
 * @param {string} team - team to modify
 * @param {string} rider - specific rider
 * @returns message to webpage
 */
function sendBreakawayCardChoice(card, team, rider) {
  let status = getLastMove(team);
  // console.log(data)

  // move card to choice and rest of hand to recycle
  let cardIndex = status.hand.hand.indexOf(card);
  status.hand.hand.splice(cardIndex, 1);

  if (status.choice) {
    status.choice.push({ rider: rider, card: card });
  } else {
    status.choice = [{ rider: rider, card: card }];
  }

  let deckNumber = status.deck.findIndex((x) => x.name == rider);

  status.deck[deckNumber].recycle = [
    ...status.deck[deckNumber].recycle,
    ...status.hand.hand,
  ];
  status.hand = {};

  updatePlayerTurn(team, status);

  checkForBreakawayCompletion();

  return "this turn complete";
}

/**
 * massive function to test end of breakaway and process it if necessary
 * @returns various things based on conditions
 */
function checkForBreakawayCompletion() {
  let allLastMoves = getAllLastMoves();

  let secondRound = false;

  allLastMoves.forEach((status) => {
    if (status.phase[0] == "first round complete") {
      secondRound = true;
    }
  });

  if (secondRound) {
    let secondRoundCheck = allLastMoves.filter((x) => x.choice.length !== 2);

    if (secondRoundCheck.length !== 0) {
      console.log("still waiting for players");

      return;
    } else {
      console.log("process second round");

      let breakawayResults = [];
      let breakawayResultsUnsorted = [];

      allLastMoves.forEach((line) => {
        breakawayResultsUnsorted.push([
          line.team,
          line.choice[0].rider,
          line.choice[0].card.charAt(0),
          line.choice[1].card.charAt(0),
          Number(line.choice[0].card.charAt(0)) +
            Number(line.choice[1].card.charAt(0)),
        ]);
      });

      let allPlayerData = getPlayerData();
      let trackData = getTrackData();

      // incase of tie arrange riders in order from back left to front right
      let currentPositions = getCurrentPositions(
        allPlayerData,
        trackData,
        "breakaway"
      );

      // create new array so when sorted by value back to front order is maintained
      currentPositions.forEach((position) => {
        let thisRider = breakawayResultsUnsorted.find(
          (x) => x[0] + x[1] == position.rider
        );
        if (thisRider) {
          breakawayResults.push(thisRider);
        }
      });

      // arrange so top bids are first
      breakawayResults.sort(
        (firstItem, secondItem) => secondItem[4] - firstItem[4]
      );

      // get number of winning riders
      let winningSpots = getBreakAwaySpots();
      let winners = breakawayResults.slice(0, winningSpots);
      let winnerList = [];

      winners.forEach((winner) => {
        winnerList.push(winner[0] + winner[1]);
      });

      winners.forEach((winner, i) => {
        // update rider deck
        processBreakAwayWinnerCards(winner[0], winner[1]);

        // move rider
        moveWinningBreakawayRider(winner[0] + winner[1], i + 1, trackData);
      });

      // put cards back in, combine, and shufffle decks
      resetDecksAfterBreakaway();

      allLastMoves.forEach((turn) => {
        let thisPlayer = allPlayerData.find((x) => x.team == turn.team);

        // notify players
        let emailTitle = `${turn.team} - Second Round Breakaway Bid Results`;

        let htmlTemplate = HtmlService.createTemplateFromFile(
          "breakaway/breakawayEmail"
        );

        htmlTemplate.player = turn;
        htmlTemplate.turnReport = breakawayResults;
        htmlTemplate.gameApiLink = gameApiLink;
        htmlTemplate.message = "Breakaway Bidding Has Finished";
        htmlTemplate.isFirstRound = false;
        htmlTemplate.winnerList = winnerList;

        let htmlForEmail = htmlTemplate.evaluate().getContent();

        MailApp.sendEmail(thisPlayer.email, emailTitle, "", {
          htmlBody: htmlForEmail,
        });
      });

      setBreakawayCounterToZero();
      removeStartNumbers();

      return;
    }
  }

  let firstRoundCheck = allLastMoves.filter((x) => x.choice.length !== 1);

  if (firstRoundCheck.length !== 0) {
    console.log("still waiting for players");
    return;
  } else {
    let breakawayResults = [];

    allLastMoves.forEach((line) => {
      breakawayResults.push([
        line.team,
        line.choice[0].rider,
        line.choice[0].card.charAt(0),
      ]);
    });

    let allPlayerData = getPlayerData();

    allLastMoves.forEach((turn) => {
      turn.phase.push("first round complete");
      updatePlayerTurn(turn.team, turn);

      let thisPlayer = allPlayerData.find((x) => x.team == turn.team);

      // notify players
      let emailTitle = `${turn.team} - First Round Breakaway Bid Results`;

      let htmlTemplate = HtmlService.createTemplateFromFile(
        "breakaway/breakawayEmail"
      );

      htmlTemplate.player = turn;
      htmlTemplate.turnReport = breakawayResults;
      htmlTemplate.gameApiLink = gameApiLink;
      htmlTemplate.message = "Choose Your Second Breakaway Bid";
      htmlTemplate.isFirstRound = true;
      htmlTemplate.winnerList = [];

      let htmlForEmail = htmlTemplate.evaluate().getContent();

      MailApp.sendEmail(thisPlayer.email, emailTitle, "", {
        htmlBody: htmlForEmail,
      });
    });
  }
}
