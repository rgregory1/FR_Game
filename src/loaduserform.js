

function loadForm() {
  
  const htmlForSidebar = HtmlService.createTemplateFromFile('sidebar')
  const htmlOutput = htmlForSidebar.evaluate()

  const ui = SpreadsheetApp.getUi()
  ui.showSidebar(htmlOutput)

}

function onOpen(){
  let ui = SpreadsheetApp.getUi()
   ui.createMenu('Play FR')
    .addItem('Choose Starting Position', 'emailNextTeam')
    .addToUi()
}