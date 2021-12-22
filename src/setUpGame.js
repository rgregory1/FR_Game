// const HOME_SHEET = "1Ng8ms_c8RuyGIXDSJgvejJUldFsp_17-rPFGY3WGeok";
const HOME_SHEET = "1t5I_Dlq56evtY3VHrauXb0KIaHNWZ_bmVvV6lmcS3Uo";
const ss = SpreadsheetApp.openById(HOME_SHEET);
const baseGameInfo = ss.getSheetByName("baseGameInfo");
const db = ss.getSheetByName('db')
const track = ss.getSheetByName('Track')

const gameApiLink = baseGameInfo.getRange('B9').getValue()  // deployed game
// const gameApiLink = baseGameInfo.getRange('B10').getValue()  // dev game


// // get parent folder id
// const spreadSheetFile = DriveApp.getFileById(HOME_SHEET);
// const folderId = spreadSheetFile.getParents().next().getId();

/**
 * builds decs from the listed decs on lines 12,13 of the base sheet
 */
function buildDecks() {
  let deckData = baseGameInfo.getRange(12, 1, 2, 17).getValues();
  // console.log(deckData);

  let decks = [];

  deckData.forEach((line) => {
    let deck = {
      name: line.shift(),
      energyDeck: [],
      hand: [],
      discard: [],
    };

    let deckLetter = line.shift();

    line.forEach((card) => {
      deck.energyDeck.push(card + deckLetter);
    });

    deck.energyDeck = shuffleDeck(deck.energyDeck);

    decks.push(deck);
  });

  console.log(decks[0], decks[1]);

  return decks;
}

function setUpGame() {
  // get base info from first seven rows
  let teamData = baseGameInfo.getRange(2, 1, 6, 5).getValues();
  teamData = teamData.filter((x) => x[3] != "");
  console.log(teamData);

  // create db sheet for tracking game turns
  const db = ss.getSheetByName("db") || ss.insert("db");
  db.clear();
  let dbheader = [["team", "turn", "phase", "hand", "choice", "deck"]];
  db.getRange(1, 1, 1, dbheader[0].length).setValues(dbheader);

  // setup each team with all necessary sheets and data
  teamData.forEach((team) => {
    // create decks
    var decks = buildDecks();

    // turn deck list of objects into strings for storage
    let deckString = JSON.stringify(decks);

    // add initial data to db
    db.appendRow([team[1], -1, 0, "", "", deckString]);
  });
}
