function testNumbersOrEmpty(){

  // let test = ''  // here we are       false - false
  // let test = '12'  // here we are        true - false
  let test = 'GreenSprinter'  // here we are true - false


  console.log(test !== '')
  console.log(isNaN(test))

  if(test !== '' && isNaN(test)){
    console.log('here we are')
  } else{
    console.log('go on')
  }

}


function stringTest(){
  let dude = {
    name: 'the dude',
    notBrevity: 'el duderinon',
    bowling: 212,
    friends: ['Donnie', 'Walter']
  }

  console.log(dude)
  // return dude

  var ss = SpreadsheetApp.openById(HOME_SHEET);
  var baseGameInfo = ss.getSheetByName('baseGameInfo');
  baseGameInfo.getRange(20,1).setValue(dude)

  var payload = JSON.stringify(dude);
  baseGameInfo.getRange(21,1).setValue(payload)

}


function getObject(){
  var ss = SpreadsheetApp.openById(HOME_SHEET);
  var baseGameInfo = ss.getSheetByName('baseGameInfo');
  var newObject  = baseGameInfo.getRange(20,1).getValue();
  var newObject2  = baseGameInfo.getRange(21,1).getValue();

  console.log(newObject)
  console.log(typeof newObject)

  console.log(newObject.name);

  var theObject = JSON.parse(newObject2);
  console.log(theObject);
  console.log(typeof theObject);
  console.log(theObject.name);

}


function jsonifyEmptyString(){

  let empty = JSON.stringify('')

  

  console.log(empty)

}





