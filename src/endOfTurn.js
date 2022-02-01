function endOfTurn() {

  // initial moves
  moveAllRiders()

  // drafting
  draftPhase()

  // exaustion
  exhaustion()

 
}



function checkForWinner(){

  let gameOver = false
  let placements = []

  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues()

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData, 'movephase')

  // test each rider to see if they are in a 'finish' square, if so mark
  // mark thier finish position
  currentPositions.forEach((thisGuy,index) => {
    // update rider position for check
      let currentXY = getRiderXY(thisGuy.rider, trackData)

      // test current square for Incline or Cobbles
      let thisCell = trackData[currentXY.y][currentXY.x]
      if (thisCell.split('-')[0] == 'F'){
        
        placements.push({rider: thisGuy.rider, place: index+1})
      }
      
  })

  if(placements.length !== 0){
    addPlaceToSummary(placements)
  }
  


}











