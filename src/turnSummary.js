
// let allPlayerMoves = [
//   {rider: "GreenRoller", move: 4}, 
//   {rider: "GreenRoller", move: 4},
//   ]

function initialTurnSummary(allPlayerMoves) {

  let turnNumber = getCurrentGameTurn() + 1
  
  // let turnSumData = turnSum.getDataRange().getValues()

  let playerMoveString =  JSON.stringify(allPlayerMoves)

  turnSum.appendRow([turnNumber,playerMoveString])

}

// let reductions = [
//   {rider: "GreenRoller", reduction: 1},
//   {rider: "GreenSprinter", reduction: 2}
// ]

function addReductionsToSummary(reductions= [{rider: "GreenRoller", reduction: 1}]){

  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  reductions.forEach(redux => {
    riderData.forEach(rider => {
      if(redux.rider == rider.rider){
        rider.reduction = redux.reduction
      }
    })
  })

  console.log(riderData)
  let playerMoveString =  JSON.stringify(riderData)

  turnSum.appendRow([thisTurnSum[0],playerMoveString])

}



function addOccurancesToSummary(summary = ['GreenSprinter','GreenSprinter'], type='exhaustion'){

  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  riderData.forEach(rider => {
   
      let ocurrances = summary.filter(x => x == rider.rider).length

      if (ocurrances > 0){
        rider[type] = ocurrances
      }
    
  })

  console.log(riderData)

  let playerMoveString =  JSON.stringify(riderData)

  turnSum.appendRow([thisTurnSum[0],playerMoveString])
}


function getLastSummaryLine(){

  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  return riderData
}








