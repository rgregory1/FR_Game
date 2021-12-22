/**
 *  this grabs track data and returns it to the webapp
 *  the new Date argument is there to ensure that it runs the 
 *  function and grabs new data
 */
function getTrackData(howdy = new Date()) {
  SpreadsheetApp.flush()
  let trackData = track.getDataRange().getValues()

  console.log(trackData)
  
  return(trackData)
}

/**
 *  allows me to include additional templates in the webapp page
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}