function exhaustion() {
  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues()

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData)

  // gather exhaustion data for summary
  let exhaustionSummary = []

  currentPositions.forEach(thisGuy => {
    let isExhausted

    // update rider position for check
    let currentXY = getRiderXY(thisGuy.rider, trackData)

    // test of rider is past finish line
    let thisCell = trackData[currentXY.y][currentXY.x]
    if (thisCell.split("-")[0] == "F") {
      isExhausted = false
    } else {
      // -------------------------  test if next square is empty
      let nextCellx = currentXY.x + 1

      for (let i = 0; i < trackData.length; i++) {
        let nextCell = trackData[i][nextCellx]
        let nextCellData = nextCell.split("-")

        if (nextCellData[0] == "B") {
          // console.log("border");
        } else if (nextCellData[1] == "") {
          // console.log("clear cell");
          isExhausted = true
        } else {
          // console.log("blocked");
          isExhausted = false
        }
      }
    }

    // add exhaustion to rider recycle deck
    if (isExhausted) {
      addExhaustion(thisGuy.rider)
      exhaustionSummary.push(thisGuy.rider)
    }
  })

  addOccurancesToSummary(exhaustionSummary, "exhaustion")
}

function addExhaustion(rider = "BlackRoller") {
  let riderArray = rider.split(/(?=[A-Z])/)

  // get current deck
  let status = getLastMove(riderArray[0])

  // exhaustion to the recycle
  status.deck.forEach(thisDeck => {
    if (thisDeck.name == riderArray[1]) {
      thisDeck.recycle.push("2E")
    }
  })
  // console.log(status)

  // update the db
  updatePlayerTurn(riderArray[0], status)
}

function draftPhase() {
  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues()

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData, "draft")

  let drafting = true

  // start to collect the draft count for the turn summary
  let riderDraftCount = []

  while (drafting) {
    let draftCount = 0

    currentPositions.forEach(thisGuy => {
      // check for end of track
      let endOfDraft = trackData[0].length - 2
      if (thisGuy.x < endOfDraft) {
        let draftBlockers = ["I", "C"]

        // update rider position for check
        let currentXY = getRiderXY(thisGuy.rider, trackData)

        // test current square for Incline or Cobbles
        let thisCell = trackData[currentXY.y][currentXY.x]
        let isClear = draftBlockers.indexOf(thisCell.split("-")[0]) == -1
        if (isClear) {
          console.log("the riders space is clear")
        }

        // -------------------------  test if next square is empty
        let nextCellx = currentXY.x + 1
        let isNextCellClear

        for (let i = 0; i < trackData.length; i++) {
          let nextCell = trackData[i][nextCellx]
          let nextCellData = nextCell.split("-")

          let isNextClear = draftBlockers.indexOf(nextCellData[0]) == -1

          if (nextCellData[0] == "B") {
            console.log("border")
          } else if (isNextClear && nextCellData[1] == "") {
            console.log("clear cell")
            isNextCellClear = true
          } else {
            console.log("blocked")
            isNextCellClear = false
          }
        }

        // -------------------------  test if square + 2 is empty
        let twoCellx = currentXY.x + 2
        let isTwoCellOccupied

        for (let i = 0; i < trackData.length; i++) {
          let twoCell = trackData[i][twoCellx]
          let twoCellData = twoCell.split("-")

          let isTwoClear = draftBlockers.indexOf(twoCellData[0]) == -1

          if (twoCellData[0] == "B") {
            console.log("border")
          } else if (isTwoClear) {
            if (twoCellData[1] !== "") {
              console.log("flat and occupied")
              isTwoCellOccupied = true
            } else {
              console.log("no drafter")
              isTwoCellOccupied = false
            }
          } else {
            console.log("incline or cobbles")
            isTwoCellOccupied = false
          }
        }

        console.log(thisGuy.rider)
        if (isClear && isNextCellClear && isTwoCellOccupied) {
          console.log("this guy drafts...")

          // move the rider on the track and in the trackData
          moveOneRider(currentXY, 1, trackData)
          draftCount++
          riderDraftCount.push(currentXY.rider)
          SpreadsheetApp.flush()

          // test for other riders in the same square
          let ridersInSameSquare = []
          // find other riders in same square
          let otherRiders = currentPositions.filter(
            x => x.rider !== thisGuy.rider
          )

          otherRiders.forEach(otherRider => {
            if (otherRider.x == currentXY.x) {
              ridersInSameSquare.push(otherRider)
            }
          })

          if (ridersInSameSquare.length > 0) {
            ridersInSameSquare.forEach(otherRider => {
              console.log("also in same square: ", otherRider.rider)

              // move each rider in the square forward
              moveOneRider(otherRider, 1, trackData)
              riderDraftCount.push(otherRider.rider)
            })
          }
        } else {
          console.log("this guy sticks")
        }
      } else {
        console.log("too near the end to draft")
      }
    })

    // reconfigure current positions
    currentPositions = getCurrentPositions(playerData, trackData, "draft")

    SpreadsheetApp.flush()

    if (draftCount == 0) {
      drafting = false
    }
  }

  // add draft count to turn summary
  addOccurancesToSummary(riderDraftCount, "draft")
}

function moveAllRiders() {
  let trackData = track.getDataRange().getValues()

  // // get array of arrays with only the riders marked on it
  // let positionData = getPositionData(trackData)

  let playerData = getPlayerData()

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData, "movephase")

  let allPlayerMoves = getAllChoices()

  // store player moves in turn summary
  initialTurnSummary(allPlayerMoves)
  // prepare for reduction data
  let reductions = []

  currentPositions.forEach((currentRider, index) => {
    // match rider to move
    let currentMove = allPlayerMoves.find(x => x.rider == currentRider.rider)

    // // check for incline/decline/feedzone and adjust move...
    let adjustedMove = checkForMoveAdjustments(
      currentRider,
      currentMove.move,
      trackData
    )

    let finalYPosition = moveOneRider(currentRider, adjustedMove, trackData)

    // test if full move not taken
    let expectedMove = currentRider.x + currentMove.move
    if (finalYPosition !== expectedMove) {
      // reductions.push({rider: currentRider.rider, reduction: expectedMove - finalYPosition})
      reductions.push({
        rider: currentRider.rider,
        reduction: finalYPosition - expectedMove,
      })
    }
  })

  addReductionsToSummary(reductions)

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
function moveRiderOnTrack(i, pp, currentRider, cellData, trackData) {
  // update track spreadsheet with new position
  track.getRange(i + 1, pp + 1).setValue(cellData[0] + "-" + currentRider.rider)
  //update array of arrays so next moves reflect new spaces taken
  trackData[i][pp] = cellData[0] + "-" + currentRider.rider

  // free up old space on track
  let oldPosition = track
    .getRange(currentRider.y + 1, currentRider.x + 1)
    .getValue()
  track
    .getRange(currentRider.y + 1, currentRider.x + 1)
    .setValue(oldPosition.split("-")[0] + "-")
  // free up old space in array of arrays
  trackData[currentRider.y][currentRider.x] = oldPosition.split("-")[0] + "-"
}

function getRiderXY(rider, trackData) {
  if (trackData === undefined) {
    trackData = track.getDataRange().getValues()
  }

  let riderPosition = { rider: rider }
  trackData.forEach((line, i) => {
    let foundIt = line.findIndex(x => x.includes(rider))
    if (foundIt !== -1) {
      console.log("y: ", i)
      console.log("x: ", foundIt)
      riderPosition.x = foundIt
      riderPosition.y = i
    }
  })

  console.log(riderPosition)

  return riderPosition
}

function getCurrentPositions(playerData, trackData, sortType) {
  // gather xy data for each rider
  let currentPositions = []

  playerData.forEach(player => {
    let roller = player.team + "Roller"

    let rollerPosition = getRiderXY(roller, trackData)

    currentPositions.push(rollerPosition)

    let sprinter = player.team + "Sprinter"

    let sprinterPosition = getRiderXY(sprinter, trackData)

    currentPositions.push(sprinterPosition)
  })

  // filter out removed rider data
  currentPositions = currentPositions.filter(element => "x" in element)

  if (sortType == "draft") {
    // sort so upper lines are first in list, to establish left and right lane heirarchy
    currentPositions.sort((firstItem, secondItem) => firstItem.y - secondItem.y)
    // sort so lead riders are first in list
    currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)
    currentPositions.reverse()
  } else if (sortType == "movephase") {
    // sort so lower lines are first in list, to establish left and right lane heirarchy
    currentPositions.sort((firstItem, secondItem) => secondItem.y - firstItem.y)
    // sort so lead riders are first in list
    currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)
  } else if (sortType == "breakaway") {
    // sort so higher lines are first in list, to establish left and right lane heirarchy
    currentPositions.sort((firstItem, secondItem) => secondItem.y - firstItem.y)
    // sort so lead riders are first in list
    currentPositions.sort((firstItem, secondItem) => secondItem.x - firstItem.x)
    currentPositions.reverse()
  }

  return currentPositions
}

/**
 * return all cards played be each rider
 */
function getAllChoices() {
  let playerData = getPlayerData()

  let playerChoices = []

  playerData.forEach(player => {
    let thisPlayerData = getLastMove(player.team)
    console.log(thisPlayerData)

    if (thisPlayerData.special.length < 2) {
      playerChoices.push({
        rider: thisPlayerData.team + thisPlayerData.choice[0].rider,
        move: Number(thisPlayerData.choice[0].card.charAt(0)),
      })
      playerChoices.push({
        rider: thisPlayerData.team + thisPlayerData.choice[1].rider,
        move: Number(thisPlayerData.choice[1].card.charAt(0)),
      })
    }
  })

  // filter out finished players
  playerChoices = playerChoices.filter(x => Boolean(x.move))

  return playerChoices
}

/**
 * return an array of arrays with only the riders data
 * in the cells
 */
function getPositionData(trackData) {
  let positionData = []
  trackData.forEach(line => {
    let positionLine = []
    line.forEach(cell => {
      let cellData = cell.split("-")
      if (cellData[0] !== "B") {
        if (isNaN(cellData[1])) {
          positionLine.push(cellData[1])
        } else {
          positionLine.push("")
        }
      } else positionLine.push("")
    })
    positionData.push(positionLine)
  })

  return positionData
}
