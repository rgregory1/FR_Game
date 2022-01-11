
/**
 * find space to move rider too
 * @param {Ojbect} rider Send rider data {rider: 'BlueSprinter', x: 22, y: 2}
 * @param {Number} move  max move entered 
 * @param {Array} trackData array of arrays representing the track
 */
// function moveOneRider(rider={rider: 'GreenSprinter', x: 7, y: 1}, move=1, trackData) {
function moveOneRider(rider, move, trackData) {

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
              // // -------------------------------------- moved to function moveRiderOnTrack
              // // update track spreadsheet with new position
              // track.getRange(i+1,pp+ 1).setValue(cellData[0] + "-" + currentRider.rider)
              // //update array of arrays so next moves reflect new spaces taken
              // trackData[i][pp] = cellData[0] + "-" + currentRider.rider

              // // free up old space on track
              // let oldPosition = track.getRange(currentRider.y+1, currentRider.x+1).getValue()
              // track.getRange(currentRider.y+1, currentRider.x+1).setValue(oldPosition.split("-")[0] + "-")
              // // free up old space in array of arrays
              // trackData[currentRider.y][currentRider.x] = oldPosition.split("-")[0] + "-"
              // // --------------------------------------end moved to function

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
  // })
}
