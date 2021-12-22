function sendStartingPos(parameter) {
  // console.log('from the app: ',parameter.roller)
  // console.log('from the app: ',parameter.sprinter)

  let startPositions = track.getRange(2, 1, 2, 5).getValues();

  startPositions.forEach((line) => {
    var spIndex = line.indexOf(Number(parameter.sprinter));

    if (spIndex !== -1) {
      line[spIndex] = "sprinter";
    }

    var roIndex = line.indexOf(Number(parameter.roller));

    if (roIndex !== -1) {
      line[roIndex] = "roller";
    }
  });

  track.getRange(2, 1, 2, 5).setValues(startPositions);
  SpreadsheetApp.flush();

  return;
}

function sendPost() {
  var data = {
    type: "startingPos",
    rollerStartPos: "5",
    sprinterStartPos: "10",
  };

  var options = {
    method: "POST",
    payload: data,
  };
  var url =
    "https://script.google.com/macros/s/AKfycbyO2jj1VNW-R4HMG8ZDEWjSMBf99FXiNrFwIvYR0v9kyqNiIL-vCDQvDEkDpqEvhFc/exec";
  var response = UrlFetchApp.fetch(url, options);

  console.log(response.getContentText());
}
