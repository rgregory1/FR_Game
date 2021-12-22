// const HOME_SHEET = '1Ng8ms_c8RuyGIXDSJgvejJUldFsp_17-rPFGY3WGeok'
// const ss = SpreadsheetApp.openById(HOME_SHEET);
// const baseGameInfo = ss.getSheetByName('baseGameInfo');

// // get parent folder id
// const spreadSheetFile = DriveApp.getFileById(HOME_SHEET)
// const folderId = spreadSheetFile.getParents().next().getId()

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

  // setup each team with all necessary sheets and data
  teamData.forEach((team) => {
    // create sheet to keep track of decks
    let teamSheet = ss.getSheetByName(team[1]) || ss.insertSheet(team[1]);
    let teamSheetId = teamSheet.getSheetId();

    // create decks
    var decks = buildDecks();

    // turn deck list of objects into strings for storage
    let deckString = JSON.stringify(decks);

    // add initial data to each team sheet
    let headers = [
      ["Round", "Phase", "Hand", "Decks"],
      [0, 0, "", deckString],
    ];

    teamSheet.getRange(1, 1, 2, 4).setValues(headers);

    // fill in sheet id so decks can be accessed later
    baseGameInfo.getRange(team[0] + 1, 5).setValue(teamSheetId);

    // create new seperate sheets to be shared with each player
    let teamSSid = createNewSpreadSheet(team[1], team[3]);
    baseGameInfo.getRange(team[0] + 1, 6).setValue(teamSSid);
  });
}

/**
 *  creates a new sheet for each player in the same folder as the base game
 */
function createNewSpreadSheet(color, player) {
  let fileName = color + "-playersheet";

  // create new sheet for each player
  let file = Drive.Files.insert({
    title: fileName,
    mimeType: MimeType.GOOGLE_SHEETS,
    parents: [{ id: folderId }],
  });

  // share sheet with new player
  var newFile = SpreadsheetApp.openById(file.id);

  // rename first sheet to color name
  newFile.getSheetByName("Sheet1").setName(color);
  newFile.addEditor(player);

  // console.log(file.id)

  return file.id;
}
