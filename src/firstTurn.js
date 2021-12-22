function firstTurn() {
  // get base info from first seven rows
  let teamData = baseGameInfo.getRange(2, 1, 6, 6).getValues();
  teamData = teamData.filter(x => x[3] != '')
  console.log(teamData);

  let track = ss.getSheetName('Track')

  
}
