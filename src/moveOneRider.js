
/**
 * find space to move rider too
 * @param {Ojbect} rider Send rider data {rider: 'BlueSprinter', x: 22, y: 2}
 * @param {Number} move  max move entered 
 * @param {Array} trackData array of arrays representing the track
 */
// function moveOneRider(rider={rider: 'GreenSprinter', x: 7, y: 1}, move=1, trackData) {
function moveOneRider(rider, move, trackData) {

  let finalYPosition

  if(trackData === undefined){
    trackData = track.getDataRange().getValues()
  }

  // calculate where the ride should end up
  let potentialPosition = rider.x + move

  let isRiderPlaced = false

  // if space is not free, remove one row and test new row until you get to the original place
  for(let pp = potentialPosition; pp >= rider.x; pp-- ){

          // test if potential space is free
          for(let i = trackData.length-1; i >= 0; i--){
            
            let cellData = trackData[i][pp].split("-")

            if (cellData[0] !== 'B' && cellData[1] == ''){
              console.log('we are good to move here: ', rider.rider)
              console.log('Position x: ', i)
              console.log('Position y: ',pp)

              moveRiderOnTrack(i, pp, rider, cellData, trackData)

              finalYPosition = pp

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
  
  return finalYPosition
}


// (rider={rider: 'GreenSprinter', x: 4, y: 2}, move=9, trackData)
function checkForMoveAdjustments(rider, potentialMove, trackData){
// function checkForMoveAdjustments(rider={rider: 'GreenRoller', x:4,y:3}, potentialMove=9, trackData){


  let move = potentialMove

  if(trackData === undefined){
    trackData = track.getDataRange().getValues()
  }

  // get cell the rider is in
  let currentCell = trackData[rider.y][rider.x]

  let currentCellData = currentCell.split("-")[0]

  // test cell for decline or feedzone
  if(currentCellData == 'Z' && potentialMove < 4 ){
    move = 4
  } else if(currentCellData == 'D' && potentialMove < 5){
    move = 5
  } 

  if(move > 5){
    // test from current cell to last potential cell for incline

    let isInclineFirstSix
    let isInclineAtAll

    // let isIncline = false
    let potentialPosition = rider.x + move

    // get incline array
    let inclineArray = getInclineArray(rider, potentialPosition, trackData)
    console.log(inclineArray)

    // text for incline in first six spaces
    let firstSix = inclineArray.slice(0,7)

    console.log(firstSix)

    let firstSixTrueIndex = firstSix.findIndex(x => x == true)
    if(firstSixTrueIndex == -1){
      isInclineFirstSix = false
    } else isInclineFirstSix = true
    
    let isInclineAtAllIndex = inclineArray.findIndex(x => x == true)
    if(isInclineAtAllIndex == -1){
      isInclineAtAll = false
    } else isInclineAtAll = true
    

    if(isInclineFirstSix == true){
      move = 5 
    } else if(isInclineAtAll == true){
      let trueIndex = inclineArray.findIndex(x => x == true)
      console.log(trueIndex)
      move = trueIndex - 1
    }

  }
  console.log('move is: ', move)
  return move
}






function getInclineArray(rider, potentialPosition, trackData){

  let inclineArray = []

  // test each square up to the last, collect false and true for each square
    for(let pos = rider.x; pos <= potentialPosition; pos++ ){

      let isSquareIncline = false

      // test if potential space is free
      for(let i = trackData.length-1; i >= 0; i--){
        
        let cellData = trackData[i][pos].split("-")

        // console.log('checking for incline')
        // console.log('Position y: ', i)
        // console.log('Position X: ',pos)

        if (cellData[0] == 'I'){
          
          // console.log('incline')
          isSquareIncline = true
          break

        } else {
          // console.log('no incline: ', cellData[0])
        }
      }
      
      // push square date to incline array
      inclineArray.push(isSquareIncline)
    }

  return inclineArray
}




