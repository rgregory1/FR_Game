
const ss = SpreadsheetApp.getActive()
const baseGameInfo = ss.getSheetByName("baseGameInfo");
const db = ss.getSheetByName('db')
const track = ss.getSheetByName('Track')

// const gameApiLink = baseGameInfo.getRange('B9').getValue()  // deployed game
const gameApiLink = baseGameInfo.getRange('B10').getValue()  // dev game

function onOpen(){
  let ui = SpreadsheetApp.getUi()
   ui.createMenu('Play FR')
    .addItem('Setup Game', 'setUpGame')
    .addItem('Reset Turn', 'resetGameTurn')
    .addToUi()
}

// // get parent folder id
// const spreadSheetFile = DriveApp.getFileById(HOME_SHEET);
// const folderId = spreadSheetFile.getParents().next().getId();

/**
 * builds decs from the listed decs on lines 12,13 of the base sheet
 */
function buildDecks() {
  let deckData = baseGameInfo.getRange(21, 1, 2, 17).getValues();
  // console.log(deckData);

  let decks = [];

  deckData.forEach((line) => {
    let deck = {
      name: line.shift(),
      energyDeck: [],
      recycle: [],
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
    db.appendRow([team[1], -1, 0, JSON.stringify({}), JSON.stringify([]), deckString]);
  });

  // set game turn to -1
   baseGameInfo.getRange('B11').setValue(-1)

  emailNextTeam()
}

function resetGameTurn(){

  let trackRestore = ss.getSheetByName('trackRestore').getDataRange().getValues()
  let dbRestore = ss.getSheetByName('dbRestore').getDataRange().getValues()

  track.clearContents()
  track.getRange(1,1,trackRestore.length, trackRestore[0].length).setValues(trackRestore)

  db.clearContents()
  db.getRange(1,1, dbRestore.length, dbRestore[0].length).setValues(dbRestore)

}









