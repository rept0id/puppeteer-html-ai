Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.answer = answer;
var _puppeteer = _interopRequireDefault(require("puppeteer"));
var _syncHtml = _interopRequireDefault(require("./utils/syncHtml.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// for local use

/*** * * ***/

async function syncHtmlAnswer(htmlAns, page, selectorPage) {
  if (htmlAns === null) {
    console.log("syncHtmlAns", "error", "htmlAns is null");
    return;
  }

  /*** * * ***/

  const browserAns = await _puppeteer.default.launch({
    headless: true
  });
  const pageAns = await browserAns.newPage();
  await pageAns.setContent(htmlAns);

  /*** * * ***/

  await (0, _syncHtml.default)(page, selectorPage, pageAns);

  /*** * * ***/

  browserAns.close();
}

/*** * * ***/

async function fetchAnswer(html, contextAi, keyAi) {
  try {
    let ansAi;
    let answer;

    /*** * * ***/

    const contentReqAi = `
          Context: \`${contextAi}\`,
          Command: \`
              REPLY, BASED ON THE HTML BELOW, ONLY WITH HTML CODE POPULATED WITH ANSWERS. 
              DONT GIVE DESCRIPTIONS OR EXPLANATIONS. ONLY HTML CODE. YOUR ANSWER IS PASSED TO AN HTML PARSER.

              NEVER LEAVE VALUES EMPTY. 
               FOR EXAMPLE, IF THEY ASK \"HOW MANY YEARS YOU DO THIS...\", GIVE A NUMBER, DONT LEAVE IT EMPTY.
               FOR EXAMPLE, NEVER LEAVE A \"SELECT\" WITH DEFAULT (LIKE \"SELECT AN OPTION\").

              IF, FOR EXAMPLE, THEY ASK \"HOW MANY YEARS YOU DO THIS...\", JUST REPLY WITH A NUMBER, FOR EXAMPLE \'2\'.
          \`,
          HTML: \`${html}\`
      `;
    const reqAi = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${keyAi}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: contentReqAi
        }],
        temperature: 1 // max : 2.0
      })
    });
    const resAi = await reqAi.json();
    ansAi = resAi?.choices[0]?.message?.content?.trim();

    /*** * * ***/

    answer = ansAi;

    /*** * * ***/

    return answer;
  } catch (err) {
    console.log(err);
    return null;
  }
}
async function worthAnswer(page, selectorPage, errSelectorPage = null) {
  return await page.evaluate(async (selectorPage, errSelectorPage) => {
    let res = false;
    let doc = document.querySelector(selectorPage);

    /*** * * ***/

    if (errSelectorPage !== null) {
      if (!doc?.querySelector(errSelectorPage)) {
        res = false;
        return res;
      }
    }

    /*** * * ***/

    doc?.querySelectorAll("input[type='text']").forEach(el => {
      if (el.value.length == 0) {
        res = true;
      }
    });
    if (doc?.querySelectorAll("option").length > 0) {
      res = true;
    }
    if (doc?.querySelectorAll("input[type='radio']").length > 0) {
      res = true;
    }

    /*** * * ***/

    return res;
  }, selectorPage, errSelectorPage);
}
async function answer(contextAi, keyAI, page, selectorPage, errSelectorPage = null) {
  let html;
  let htmlAns;
  if (!(await worthAnswer(page, selectorPage, errSelectorPage))) {
    return;
  }
  html = await page.evaluate(async selector => {
    return document.querySelector(selector)?.innerHTML;
  }, selectorPage);
  htmlAns = await fetchAnswer(html, contextAi, keyAI);
  syncHtmlAnswer(htmlAns, page, selectorPage);
}