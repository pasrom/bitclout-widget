// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: dollar-sign;
// Version 0.2.0

usdBtcTracker = "https://blockchain.info/ticker"
getExchangeRate = "https://api.bitclout.com/get-exchange-rate"
imgBitCloutUrl = "https://i.imgur.com/NAosi4v.png"
betterRequestUrl = "https://gist.githubusercontent.com/schl3ck/2009e6915d10036a916a1040cbb680ac/raw/40479947fca779a38a0001cfdb141b112bd1d120/BetterRequest.js"

request = new Request(usdBtcTracker);
requestUsdBtcTrackerStr = await request.loadJSON()

request2 = new Request(getExchangeRate);
requestGetExchangeRate = await request2.loadJSON()

const actUsdPrice = 1e9 / (1e9 / requestGetExchangeRate.SatoshisPerBitCloutExchangeRate / requestUsdBtcTrackerStr.USD.last * 1e8)

const themes = {
  light: {
    picColor: "#000000",
    textColor: "777777",
  },
  dark: {
    picColor: "#ffffff",
    textColor: "#ffffff",
  }
}

if (Device.isUsingDarkAppearance()) {
  var theme = themes['dark']
  var darkMode = true
} else {
  var theme = themes['light']
  var darkMode = false
}

// load module from url
const loadModule = (name, version, url) => {
  return new Promise((callback) => {
    const fm = FileManager.iCloud()
    const modulesPath = fm.joinPath(fm.documentsDirectory(), 'modules/')
    const modulePath = fm.joinPath(modulesPath, `${name}/`)
    const filePath = fm.joinPath(modulePath, `${name}-${version}.js`)

    if (!fm.fileExists(modulePath)) {
      fm.createDirectory(modulePath, true)
    }
    if (!fm.fileExists(filePath)) {
      const req = new Request(url)
      req.loadString().then(res => {
        fm.writeString(filePath, `${res}`).then(() => {
          callback(importModule(filePath))
        })
      })
    } else {
      fm.downloadFileFromiCloud(filePath).then(() => {
        callback(importModule(filePath))
      })
    }
  })
}
module.exports = loadModule

const BetterRequest = await loadModule("BetterRequest", "2009e6915", betterRequestUrl)

async function getProfile(name) {
  let req = new BetterRequest("https://api.bitclout.com/get-profiles");
  req.method = "post";
  req.json = {
    PublicKeyBase58Check: "",
    Username: name,
    NumToFetch: 1,
    ModerationType: "",
    FetchUsersThatHODL: false,
    AddGlobalFeedBool: false
  };
  return await req.loadJSON();
}

/**
 * request cache
 * Map<string, any>
 */
const request_cache = new Map()

const widgetSizes = {
  small: { width: 465, height: 465 },
  medium: { width: 987, height: 465 },
  large: { width: 987, height: 1035 },
}

const widgetSize = widgetSizes[config.widgetFamily] ?? widgetSizes.small
let mediumWidget = (config.widgetFamily === 'medium') ? true : false

widget = await createWidget(widgetSize)

if (!config.runsInWidget) {
  if (mediumWidget) {
    await widget.presentMedium()
  } else {
    await widget.presentSmall()
  }
}

Script.setWidget(widget)
Script.complete()

async function createWidget(widgetSize) {
  const list = new ListWidget()
  textColor = new Color(theme.textColor)

  if (args.widgetParameter) {
    parameter = args.widgetParameter
  } else {
    parameter = "elonmusk;cryptocobain;RandomTask"
  }
  const names = parameter.split(";")

  const stack = list.addStack()
  stack.layoutVertically()
  stack.addSpacer()

  imgBitclout = await getLogoFromUrl(imgBitCloutUrl)
  const image = stack.addImage(imgBitclout)
  image.imageSize = new Size(60, 20)
  image.tintColor = new Color(theme.picColor)
  stack.addSpacer(3)

  const title = stack.addText("Price ~$" + actUsdPrice.toFixed(2));
  title.textColor = textColor;
  title.textOpacity = 0.8;
  title.font = new Font("Helvetica-Light ", 11);
  stack.addSpacer(3)

  for (name of names) {
    let result = await getProfile(name)
    const coinPriceBitCloutNanos = result.ProfilesFound[0].CoinPriceBitCloutNanos
    const username = result.ProfilesFound[0].Username
    const titleUser = stack.addText(username + " ~$" + (coinPriceBitCloutNanos / 1e9 * actUsdPrice).toFixed(2));
    titleUser.textColor = textColor;
    titleUser.textOpacity = 0.8;
    titleUser.minimumScaleFactor = 0.3
    titleUser.font = new Font("Helvetica-Light ", 11);
    stack.addSpacer(3)
  }

  const date = new Date();
  currentMinutes = ("0" + date.getMinutes()).slice(-2);
  currentHours = ("0" + date.getHours()).slice(-2);
  const lastUpdate = stack.addText("LastUpdate: " + currentHours + ":" + currentMinutes);
  lastUpdate.textColor = textColor;
  title.textOpacity = 0.8;
  lastUpdate.font = new Font("Helvetica-Light", 11);
  stack.addSpacer()

  return list
}

/**
 * Obtain logo images to reduce repeated image requests
 * @param {string} url the map's address
 * @return {Image} image
 */
async function getLogoFromUrl(url) {
  if (request_cache.has(url)) {
    return request_cache.get(url)
  } else {
    const request = new Request(url)
    const image = await request.loadImage()
    request_cache.set(url, image)
    return image
  }
}
