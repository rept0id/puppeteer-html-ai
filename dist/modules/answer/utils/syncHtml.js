Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
async function textInputsSyncHtml(page, selectorPage, pageAns) {
  let count;

  /*** * * ***/

  count = await page.evaluate(async selectorPage => {
    return document.querySelector(selectorPage)?.querySelectorAll("input[type='text']")?.length;
  }, selectorPage);
  if (typeof count === "undefined") {
    return;
  }
  count = parseInt(count);

  // console.log("count", count);

  /*** * * ***/

  // loop (based on count)
  for (let i = 0; i < count; i++) {
    let value;

    /*** * * ***/

    value = await pageAns.evaluate(async i => {
      return document.querySelectorAll("input[type='text']")[i]?.value;
    }, i);
    if (typeof value === "undefined") {
      continue;
    }

    /*** * * ***/

    /* 
     * Iterating with evaluate works reliably, unlike Puppeteer's methods.
     * This approach is also more reproducible. It can be taken out of Puppeteer and run even on dev tools.
     * Overall, it gives us better control and flexibility in the code.
     * 
     * Always ensure the correct events are triggered (change, input, e.t.c...) to fully simulate real user interactions.
     *  Some examples : 
     *   - for a select : el.dispatchEvent(new Event('change', { bubbles: true }));
     *   - for an input of type text : el.dispatchEvent(new Event('type', { bubbles: true }));
     **/
    await page.evaluate(async (selectorPage, i, value) => {
      let el = document.querySelector(selectorPage)?.querySelectorAll("input[type='text']")[i];

      /*** * * ***/

      el.focus();

      /*** * * ***/

      el.value = value;

      /*** * * ***/

      el.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    }, selectorPage, i, value);
  }
}
async function selectsSyncHtml(page, selectorPage, pageAns) {
  let count;

  /*** * * ***/

  count = await page.evaluate(async selectorPage => {
    return document.querySelector(selectorPage)?.querySelectorAll("select")?.length;
  }, selectorPage);
  if (typeof count === "undefined") {
    return;
  }
  count = parseInt(count);

  // console.log("count", count);

  /*** * * ***/

  // loop (based on count)
  for (let i = 0; i < count; i++) {
    /*
    * "values" is a list of strings representing selected options.
    *
    * This approach is necessary because AI responses can be unpredictable:
    *  - The AI might return only the selected option(s) instead of all available options.
    *  - The AI might return all options, but in an incorrect order.
    *
    * By focusing on the string values of the selected options rather than their indices,
    * we create a more robust solution that can handle the unpredictable nature of AI responses.
    */

    let values = [];

    /*** * * ***/

    values = await pageAns.evaluate(async i => {
      let values = [];

      /*** * * ***/

      await (async () => {
        let sopts = document.querySelectorAll("select")[i]?.selectedOptions;
        if (typeof sopts === "undefined") {
          return;
        }
        for (let i = 0; i < sopts?.length; i++) {
          let v = sopts[i].value.toString();
          values.push(`${v}`);
        }
      })();

      /*** * * ***/

      return values;
    }, i);
    console.log("selectsSyncHtml", "values", values);
    if (typeof values === "undefined") {
      continue;
    }

    /*** * * ***/

    /* 
     * Iterating with evaluate works reliably, unlike Puppeteer's methods.
     * This approach is also more reproducible. It can be taken out of Puppeteer and run even on dev tools.
     * Overall, it gives us better control and flexibility in the code.
     * 
     * Always ensure the correct events are triggered (change, input, e.t.c...) to fully simulate real user interactions.
     *  Some examples : 
     *   - for a select : el.dispatchEvent(new Event('change', { bubbles: true }));
     *   - for an input of type text : el.dispatchEvent(new Event('type', { bubbles: true }));
     **/
    await page.evaluate(async (selectorPage, i, values) => {
      let el = document.querySelector(selectorPage)?.querySelectorAll("select")[i];
      let options = el.options;

      /*** * * ***/

      el.focus();
      Array.from(options).forEach(option => {
        if (values.includes(option.value)) {
          option.selected = true;
        }
      });

      /*** * * ***/

      el.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    }, selectorPage, i, values);
  }
}
async function radiosSyncHtml(page, selectorPage, pageAns) {
  let count;

  /*** * * ***/

  count = await page.evaluate(async selectorPage => {
    return document.querySelector(selectorPage)?.querySelectorAll("input[type='radio']")?.length;
  }, selectorPage);
  if (typeof count === "undefined") {
    return;
  }
  count = parseInt(count);

  // console.log("count", count);

  /*** * * ***/

  // loop (based on count)
  for (let i = 0; i < count; i++) {
    let checked;

    /*** * * ***/

    checked = await pageAns.evaluate(async i => {
      return document.querySelectorAll("input[type='radio']")[i]?.checked;
    }, i);
    if (typeof checked === "undefined") {
      continue;
    }

    /*** * * ***/

    if (checked) {
      // Even though Puppeteer's click method works as expected,
      //  here, we use evaluate just because we shaped our code around this approach and now we can't pass index to Puppeteer's method.
      await page.evaluate(async (selectorPage, i) => {
        let el = document.querySelector(selectorPage)?.querySelectorAll("input[type='radio']")[i];
        el.click();
      }, selectorPage, i);
    }
  }
}
async function syncHtml(page, selectorPage, pageAns) {
  // texts
  await textInputsSyncHtml(page, selectorPage, pageAns);

  // selects
  await selectsSyncHtml(page, selectorPage, pageAns);

  // radios
  await radiosSyncHtml(page, selectorPage, pageAns);
}
var _default = exports.default = syncHtml;