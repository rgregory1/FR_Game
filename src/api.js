function doGet(e) {
  console.log("color: ", e.parameter.color);
  let page = HtmlService.createTemplateFromFile("page");

  page.color = e.parameter.color;

  let finalPage = page
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("FR Game");

  return finalPage;
}

// https://script.google.com/macros/s/AKfycbz_ahXJCDc3IN-Sm85LRwQ2RZrgmcBI6uGOHAFxW9bwF67XY4VtOkwSjVNo0hbEq8rKDQ/exec

// test deployment
// https://script.google.com/macros/s/AKfycbwRavrpRvDY6VVZCBpqV5R0rZIMbqf6z42HwqzK_Q_F/dev?color=Black

