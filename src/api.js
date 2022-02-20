function doGet(e) {
  console.log("color: ", e.parameter.color);

  let color = e.parameter.color;

  let lastMove = getLastMove(color);

  if (lastMove.turn == -1) {
    return loadStartPage(color);
  } else if (lastMove.turn == "B") {
    return loadBreakawayPage(color);
  } else {
    return loadGamePage(color);
  }
}

function loadStartPage(color) {
  let page = HtmlService.createTemplateFromFile("setup/startPage");

  let gameName = getGameName();

  page.color = color;

  let finalPage = page
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("FR Game - " + gameName);

  return finalPage;
}

function loadBreakawayPage(color) {
  let page = HtmlService.createTemplateFromFile("breakaway/breakawayPage");

  let gameName = getGameName();

  page.color = color;

  let finalPage = page
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("FR Game - " + gameName);

  return finalPage;
}

function loadGamePage(color) {
  let page = HtmlService.createTemplateFromFile("gamePage");

  let gameName = getGameName();

  page.color = color;

  let finalPage = page
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("FR Game - " + gameName);

  return finalPage;
}
