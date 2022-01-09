function draftPhase(){

  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues()

  // get array of arrays with only the riders marked on it
  let positionData = getPositionData(trackData)

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = []

  playerData.forEach(player => {

    let roller = player.team + 'Roller'

    let rollerPosition = getRiderXY(roller, positionData)

    currentPositions.push(rollerPosition)

    let sprinter = player.team + 'Sprinter'

    let sprinterPosition = getRiderXY(sprinter, positionData)

    currentPositions.push(sprinterPosition)

  })


   // sort so upper lines are first in list, to establish left and right lane heirarchy
  currentPositions.sort((firstItem, secondItem) => firstItem.y - secondItem.y)
  // sort so lead riders are first in list
  currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)
  currentPositions.reverse()

  // // begin testing for drafting
  // let thisGuy = {
  //   rider: 'GreenSprinter',
  //   x: 5,
  //   y: 2
  // }

  let drafting = true
  

  while(drafting){

    let draftCount = 0

    currentPositions.forEach(thisGuy => {
      let draftBlockers = ['I','C']

      // test current square for Incline or Cobbles
      let thisCell = trackData[thisGuy.y][thisGuy.x]
      let isClear = draftBlockers.indexOf(thisCell.split('-')[0]) == -1
      if(isClear) {
        console.log('the riders space is clear')
      }

      // -------------------------  test if next square is empty
      let nextCells = []
      let nextCellx = thisGuy.x + 1
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
      let twoCells = []
      let twoCellx = thisGuy.x + 2
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
        draftCount++

        let ridersInSameSquare = []
        // find other riders in same square
        let otherRiders = currentPositions.filter(x => x.rider !== thisGuy.rider)
        otherRiders.forEach(otherRider => {
          if(otherRider.x == thisGuy.x){
            ridersInSameSquare.push(otherRider)
          }
        })
        
        if(ridersInSameSquare.length > 0){
          ridersInSameSquare.forEach(otherRider => {
            console.log('also in same square: ',otherRider.rider)
          })
        }


      } else {
        console.log('this guy sticks')
      }

    })
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
  let currentPositions = []

  playerData.forEach(player => {

    let roller = player.team + 'Roller'

    let rollerPosition = getRiderXY(roller, positionData)

    currentPositions.push(rollerPosition)

    let sprinter = player.team + 'Sprinter'

    let sprinterPosition = getRiderXY(sprinter, positionData)

    currentPositions.push(sprinterPosition)

  })

  // sort so lower lines are first in list, to establish left and right lane heirarchy
  currentPositions.sort((firstItem, secondItem) => secondItem.y - firstItem.y)
  // sort so lead riders are first in list
  currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)

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

                // update track spreadsheet with new position
                track.getRange(i+1,pp+ 1).setValue(cellData[0] + "-" +currentMove.rider)
                //update array of arrays so next moves reflect new spaces taken
                trackData[i][pp] = cellData[0] + "-" +currentMove.rider

                // free up old space on track
                let oldPosition = track.getRange(currentRider.y+1, currentRider.x+1).getValue()
                track.getRange(currentRider.y+1, currentRider.x+1).setValue(oldPosition.split("-")[0] + "-")
                // free up old space in array of arrays
                trackData[currentRider.y][currentRider.x] = oldPosition.split("-")[0] + "-"


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


function getRiderXY(rider, positionData){

  let riderPosition = {rider: rider}
  positionData.forEach((line, i) =>{
    let foundIt = line.indexOf(rider)
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













