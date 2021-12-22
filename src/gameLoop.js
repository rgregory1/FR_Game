function gameLoop(team = "Black") {
  let status = findLastMove(team);

  if (status.turn == -1) {
    console.log("choose starting position");

    let possiblePositions = returnPossiblePositions();

    return { type: "startingPositions", positions: possiblePositions };
  }

  return "options";
}

// options.forEach((player) => {
//   displayP.appendChild(document.createTextNode(player.team));
//   displayP.appendChild(document.createTextNode(player.teamName));
//   displayP.appendChild(document.createTextNode(player.email));
// });
