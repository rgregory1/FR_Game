
const ss = SpreadsheetApp.getActive()
const baseGameInfo = ss.getSheetByName("baseGameInfo");
const db = ss.getSheetByName('db')
const track = ss.getSheetByName('Track')
const turnSum = ss.getSheetByName('turnSummary')
const finish = ss.getSheetByName('finish')

// const gameApiLink = baseGameInfo.getRange('B9').getValue()  // deployed game
const gameApiLink = baseGameInfo.getRange('B10').getValue()  // dev game

function onOpen(){
  let ui = SpreadsheetApp.getUi()
   ui.createMenu('Play FR')
    .addItem('Setup Game', 'setUpGame')
    .addItem('Reset Turn', 'resetGameTurn')
    .addItem('Create Restore Point', 'createRestorePoint')
    .addItem('Check 4 Turn','testForNewTurn')
    .addToUi()
}

// // get parent folder id
// const spreadSheetFile = DriveApp.getFileById(HOME_SHEET);
// const folderId = spreadSheetFile.getParents().next().getId();

/**
 * builds decs from the listed decs on lines 12,13 of the base sheet
 */
function buildDecks(d1ex,d2ex) {

  // get deck makeup
  let deckData = baseGameInfo.getRange(21, 1, 2, 17).getValues();
  
  let residualExhaustion = [Array(d1ex).fill('2E'),Array(d2ex).fill('2E')]


  let decks = [];

  deckData.forEach((line,i) => {
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

    deck.energyDeck.push(...residualExhaustion[i])

    deck.energyDeck = shuffleDeck(deck.energyDeck);

    decks.push(deck);
  });

  console.log(decks[0], decks[1]);

  return decks;
}

function setUpGame() {
  
  let playerData = getPlayerData()

  // create db sheet for tracking game turns
  const db = ss.getSheetByName("db") || ss.insert("db");
  db.clear();
  let dbheader = [["team", "speical", "turn", "phase", "hand", "choice", "deck"]];
  db.getRange(1, 1, 1, dbheader[0].length).setValues(dbheader);

  // setup each team with all necessary sheets and data
  playerData.forEach((team) => {
    
    // create decks
    var decks = buildDecks(team.deck1Ex, team.deck2Ex);

    // turn deck list of objects into strings for storage
    let deckString = JSON.stringify(decks);

    // add initial data to db
    db.appendRow([team.team,JSON.stringify([]), -1, JSON.stringify([]), JSON.stringify({}), JSON.stringify([]), deckString]);
  });

  // set game turn to -1
   baseGameInfo.getRange('B11').setValue(-1)

  // reset gameover
  baseGameInfo.getRange('B15').setValue('No')

  // clear turn summary
  turnSum.clear()
  finish.clear()
  let finishHeader = [['place','rider','past finish','turn','exhaustion']]
  finish.getRange(1,1,1,finishHeader[0].length).setValues(finishHeader)

  // get track for setup
  ss.deleteSheet(track)
  let trackBegin = ss.getSheetByName('trackBegin')
  trackBegin.copyTo(ss).setName('Track')

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

function createRestorePoint(){

  let trackInfo = track.getDataRange().getValues()
  let dbValues = db.getDataRange().getValues()

  let trackRestore = ss.getSheetByName('trackRestore')
  let dbRestore = ss.getSheetByName('dbRestore')

  trackRestore.clearContents()
  trackRestore.getRange(1,1,trackInfo.length, trackInfo[0].length).setValues(trackInfo)

  dbRestore.clearContents()
  dbRestore.getRange(1,1, dbValues.length, dbValues[0].length).setValues(dbValues)


}









