function exhaustion(){

  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues()

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData)

  currentPositions.forEach(thisGuy => {


      // update rider position for check
      let currentXY = getRiderXY(thisGuy.rider, trackData)


      // -------------------------  test if next square is empty
      let nextCellx = currentXY.x + 1
      let isExhausted

      for (let i = 0; i < trackData.length; i++){
        let nextCell = trackData[i][nextCellx]
        let nextCellData = nextCell.split("-")

        if(nextCellData[0] == 'B'){
          console.log('border')
        } else if(nextCellData[1] == ''){
          console.log('clear cell')
          isExhausted = true
        } else {
          console.log('blocked')
          isExhausted = false
        }
          
      }

      // add exhaustion to rider recycle deck
      addExhaustion(thisGuy.rider)
  })
}

function addExhaustion(rider){

  // get current deck

  // exhaustion to the reycle 

  // update the db

  
}

function draftPhase(){

  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues()

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData, 'draft')

  let drafting = true
  
  while(drafting){

    let draftCount = 0

    currentPositions.forEach(thisGuy => {
      let draftBlockers = ['I','C']

      // update rider position for check
      let currentXY = getRiderXY(thisGuy.rider, trackData)

      // test current square for Incline or Cobbles
      let thisCell = trackData[currentXY.y][currentXY.x]
      let isClear = draftBlockers.indexOf(thisCell.split('-')[0]) == -1
      if(isClear) {
        console.log('the riders space is clear')
      }

      // -------------------------  test if next square is empty
      let nextCellx = currentXY.x + 1
      let isNextCellClear

      for (let i = 0; i < trackData.length; i++){
        let nextCell = trackData[i][nextCellx]
        let nextCellData = nextCell.split("-")

        let isNextClear = draftBlockers.indexOf(nextCellData[0]) == -1

        if(nextCellData[0] == 'B'){
          console.log('border')
        } else if(isNextClear && nextCellData[1] == ''){
          console.log('clear cell')
          isNextCellClear = true
        } else {
          console.log('blocked')
          isNextCellClear = false
        }
          
      }

      // -------------------------  test if square + 2 is empty
      let twoCellx = currentXY.x + 2
      let isTwoCellOccupied

      for (let i = 0; i < trackData.length; i++){
        let twoCell = trackData[i][twoCellx]
        let twoCellData = twoCell.split("-")

        let isTwoClear = draftBlockers.indexOf(twoCellData[0]) == -1

        if(twoCellData[0] == 'B'){
          console.log('border')
        } else if(isTwoClear){
            if(twoCellData[1] !== ''){
            console.log('flat and occupied')
            isTwoCellOccupied = true
          } else {
            console.log('no drafter')
            isTwoCellOccupied = false
          }
        } else {
          console.log('incline or cobbles')
          isTwoCellOccupied = false
        }

      }

      console.log(thisGuy.rider)
      if( isClear && isNextCellClear && isTwoCellOccupied){ 
        console.log('this guy drafts...')

        // move the rider on the track and in the trackData
        moveOneRider(currentXY, 1, trackData)
        draftCount++
        SpreadsheetApp.flush()

        // test for other riders in the same square
        let ridersInSameSquare = []
        // find other riders in same square
        let otherRiders = currentPositions.filter(x => x.rider !== thisGuy.rider)

        otherRiders.forEach(otherRider => {
          if(otherRider.x == currentXY.x){
            ridersInSameSquare.push(otherRider)
          }
        })
        
        if(ridersInSameSquare.length > 0){
          ridersInSameSquare.forEach(otherRider => {
            console.log('also in same square: ',otherRider.rider)

            // move each rider in the square forward
            moveOneRider(otherRider, 1, trackData)
          })
        }


      } else {
        console.log('this guy sticks')
      }

    })

    // reconfigure current positions
    currentPositions = getCurrentPositions(playerData, trackData, 'draft')

    SpreadsheetApp.flush()
    if(draftCount == 0){
      drafting = false
    }
  }




}


function moveAllRiders() {
  
  let trackData = track.getDataRange().getValues()

  // get array of arrays with only the riders marked on it
  let positionData = getPositionData(trackData)

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData, 'movephase')

  let allPlayerMoves = getAllChoices()

  currentPositions.forEach((currentRider, index) => {

    // match rider to move
    let currentMove = allPlayerMoves.find(x => x.rider == currentRider.rider)

    // calculate where the ride should end up
    let potentialPosition = currentPositions[index].x + currentMove.move

    let isRiderPlaced = false

    // if space is not free, remove one row and test new row until you get to the original place
    for(let pp = potentialPosition; pp > currentMove.move; pp-- ){

            // test if potential space is free
            for(let i = trackData.length-1; i >= 0; i--){
              
              let cellData = trackData[i][pp].split("-")

              if (cellData[0] !== 'B' && cellData[1] == ''){
                console.log('we are good to move here: ', currentMove.rider)
                console.log('Position x: ', i)
                console.log('Position y: ',pp)

                moveRiderOnTrack(i, pp, currentRider, cellData, trackData)

                // set outer loop to break after this
                isRiderPlaced = true
                
                // stop once new position is found
                break

              } else {
                console.log('space is occupied')
                console.log('Position x: ', i)
                console.log('Position y: ',pp)
              }
            }
      if (isRiderPlaced) break
    }
  })

  // reset decks for next turn
  playerData.forEach(player => {
    resetForNewTurn(player.team)
  })
  
}

/**
 * move rider on track
 * @param {Number} i              the Y value for the rider to move to on the track
 * @param {Number} pp             the X value for the rider to move to on the track
 * @param {Object} currentRider   the rider being moved
 * @param {String} cellData       the data of the cell the rider is moving to
 * @param {Array of Arrays} trackData      the track information
 */
function moveRiderOnTrack(i, pp, currentRider, cellData, trackData){

  // update track spreadsheet with new position
  track.getRange(i+1,pp+ 1).setValue(cellData[0] + "-" + currentRider.rider)
  //update array of arrays so next moves reflect new spaces taken
  trackData[i][pp] = cellData[0] + "-" + currentRider.rider

  // free up old space on track
  let oldPosition = track.getRange(currentRider.y+1, currentRider.x+1).getValue()
  track.getRange(currentRider.y+1, currentRider.x+1).setValue(oldPosition.split("-")[0] + "-")
  // free up old space in array of arrays
  trackData[currentRider.y][currentRider.x] = oldPosition.split("-")[0] + "-"
  
}


function getRiderXY(rider, trackData){

  if(trackData === undefined){
    trackData = track.getDataRange().getValues()
  }

  let riderPosition = {rider: rider}
  trackData.forEach((line, i) =>{
    let foundIt = line.findIndex(x => x.includes(rider))
    if (foundIt !== -1){
      console.log('y: ', i)
      console.log('x: ', foundIt) 
      riderPosition.x = foundIt
      riderPosition.y = i
    }
  })

  console.log(riderPosition)

  return riderPosition
}



function getCurrentPositions(playerData, trackData, sortType){

   // gather xy data for each rider
  let currentPositions = []

  playerData.forEach(player => {

    let roller = player.team + 'Roller'

    let rollerPosition = getRiderXY(roller, trackData)

    currentPositions.push(rollerPosition)

    let sprinter = player.team + 'Sprinter'

    let sprinterPosition = getRiderXY(sprinter, trackData)

    currentPositions.push(sprinterPosition)

  })

  if(sortType == 'draft'){

    // sort so upper lines are first in list, to establish left and right lane heirarchy
    currentPositions.sort((firstItem, secondItem) => firstItem.y - secondItem.y)
    // sort so lead riders are first in list
    currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)
    currentPositions.reverse()

  } else if (sortType == 'movephase'){

    // sort so lower lines are first in list, to establish left and right lane heirarchy
    currentPositions.sort((firstItem, secondItem) => secondItem.y - firstItem.y)
    // sort so lead riders are first in list
    currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)

  }

  return currentPositions
}


/**
 * return all cards played be each rider
 */
function getAllChoices(){
  let playerData = getPlayerData()

  let playerChoices =[]

  playerData.forEach(player => {
    let thisPlayerData = findLastMove(player.team)
    console.log(thisPlayerData)
  
    playerChoices.push(
      {
        rider: thisPlayerData.team + thisPlayerData.choice[0].rider, 
        move: Number(thisPlayerData.choice[0].card.charAt(0))
        }
      )
    playerChoices.push(
      {
        rider: thisPlayerData.team + thisPlayerData.choice[1].rider, 
        move: Number(thisPlayerData.choice[1].card.charAt(0))
        }
      )
    
  })

  return playerChoices

}


/**
 * return an array of arrays with only the riders data
 * in the cells
 */
function getPositionData(trackData){

  let positionData = []
  trackData.forEach(line => {
    let positionLine = []
    line.forEach(cell => {
      let cellData = cell.split("-")
      if(cellData[0] !== 'B'){
        if(isNaN(cellData[1])){
          positionLine.push(cellData[1])
        }else {
          positionLine.push('')
        }
      } else 
        positionLine.push('')
    })
    positionData.push(positionLine)
  })

  return positionData
}













