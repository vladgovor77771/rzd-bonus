const puppeteer = require('puppeteer');
const generatePerson = require('./generate_person');
const { friendKey, threads } = require('./config');
const createUser = require('./create_user');
const EventEmitter = require('events');
const ee = new EventEmitter();

const runWorker = async () => {
  let browser;

  while (true) {
    try {
      let person = generatePerson();
      browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1920,1080']
      });
      await createUser(browser, person, friendKey);
      await browser.close();
      ee.emit('registered');
    } catch (err) {
      await browser.close();
      ee.emit('probablyRegistered');
    }
  }
}

const run = () => {
  let registered = 0;
  let probablyRegistered = 0;

  for (let i = 0; i < threads; i++) runWorker();

  ee.on('registered', () => console.log('Registered accounts:', ++registered))
  ee.on('probablyRegistered', () => console.log('Probably registered accounts:', ++probablyRegistered))
}

run()