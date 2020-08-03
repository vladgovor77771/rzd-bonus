# Auto reger for RZD bonus

## Disclaimer

Using this script you break the rules of RZD bonus. Author does not bear consequences for the use of this script by someone else.

## Prepare

```
// install node version 12+
// clone this repo
cd rzd-bonus
npm install
cp config.example.js config.js
nano config.js
// change your settings
```

If you want use this on Linux, you also need to install google chrome.

```
apt-get update \
  && apt-get install -y wget gnupg ca-certificates \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable
```


## Run

```
node index.js
```