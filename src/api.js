function doGet(e) {
  console.log("color: ", e.parameter.color);

  let color = e.parameter.color

  let lastMove = findLastMove(color)

  if (lastMove.turn == -1){
    return loadStartPage(color);
  }
  else {
    return loadGamePage(color);
  }
  
}


function loadStartPage(color){
  let page = HtmlService.createTemplateFromFile("startPage");

  let gameName = getGameName()

  page.color = color;

  let finalPage = page
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("FR Game - " + gameName);

  return finalPage;
}

function loadGamePage(color){
  let page = HtmlService.createTemplateFromFile("gamePage");

  let gameName = getGameName()
  
  page.color = color;
  
  let finalPage = page
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("FR Game - " + gameName);

  return finalPage;
}