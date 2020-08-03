const axios = require('axios');
const Captcha = require('async-captcha');
const { antiCaptchaKey } = require('./config');
const anticaptcha = new Captcha(antiCaptchaKey, 2, 10);
const waitForNetworkIdle = require('./page_wait_for_network_idle');
const sleep = require('sleep-promise');

module.exports = async (browser, person, friendKey) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080});
  await page.goto('https://rzd-bonus.ru/registration/', { waitUntil: 'networkidle0', timeout: 120000 });
  await page.type('#reg_name1', person.surname, { delay: 40 });
  await page.type('#reg_name2', person.name, { delay: 40 });
  await page.type('#reg_name3', person.fatherName, { delay: 40 });
  await page.type('[name="REGISTER[UF_REGION]"]', person.region.value, { delay: 40 });
  await page.select('[name="REGISTER[PERSONAL_GENDER]"]', person.gender == 'male' ? 'M' : 'F');

  await page.select('[name="db[day]"]', person.dob[0]);
  await page.select('[name="db[month]"]', person.dob[1]);
  await page.select('[name="db[year]"]', person.dob[2]);

  await page.type('#reg_email', person.email, { delay: 40 });
  await page.evaluate((phone) => { document.querySelector('#reg_phone').value = phone }, person.phoneNumber);

  let citySuggestions = await axios({
    method: 'post',
    url: 'https://rzd-bonus.ru/ajax/list.locations.php',
    data: `region=${person.region.data}`
  });

  let cityValue = citySuggestions.data.suggestions[Math.round(Math.random() * (citySuggestions.data.suggestions.length - 1))].value;

  await page.type('[name="REGISTER[UF_LOCALITY]"]', cityValue, { delay: 40 });
  await page.evaluate((passport) => { document.querySelector('[name="UF_DOC_NUM"]').value = passport }, person.passport);
  await page.type('[name="UF_SANSWER"]', person.secretAnswer, { delay: 40 });
  await page.type('[name="REGISTER[PASSWORD]"]', person.password, { delay: 40 });
  await page.type('[name="REGISTER[CONFIRM_PASSWORD]"]', person.password, { delay: 40 });

  // friend key
  await page.type('[name="UF_INVITED"]', friendKey, { delay: 40 });

  const captchaUrl = await page.$eval('img[style="width:129px;height:51px;"]', e => e.src);
  const captchaImg = await axios.get(captchaUrl, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(captchaImg.data, 'binary').toString('base64');
  const captchaCode = await anticaptcha.getResult(base64, {
    case: true
  });

  await page.type('#reg_code', captchaCode, { delay: 40 });
  await page.click('#fb_check');
  await sleep(500);

  await Promise.all([
    page.click('button[type="submit"]'),
    waitForNetworkIdle(page, 3000)
  ]);

  if (page.url().indexOf('cabinet') < 0)
    throw new Error('Page url not contains "cabinet"!');
}