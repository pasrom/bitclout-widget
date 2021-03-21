// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: dollar-sign;
// Version 0.1.0

const ethGasStationApiUrl = `https://ethgasstation.info/api/ethgasAPI.json`;
const req = new Request(ethGasStationApiUrl);
const res = await req.loadJSON();

usdBtcTracker = "https://blockchain.info/ticker"
getExchangeRate = "https://api.bitclout.com/get-exchange-rate"
imgBitCloutUrl = "https://i.imgur.com/WqhXjJS.png"

request = new Request(usdBtcTracker);
requestUsdBtcTrackerStr = await request.loadJSON()

request2 = new Request(getExchangeRate);
requestGetExchangeRate = await request2.loadJSON()

const actUsdPrice =  1e9 / (1e9 / requestGetExchangeRate.SatoshisPerBitCloutExchangeRate / requestUsdBtcTrackerStr.USD.last * 1e8)

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
log(widget)
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
    list.backgroundColor = new Color("#b00a0f")

    const stack = list.addStack()
    stack.layoutVertically()
    stack.addSpacer()

    imgBitclout = await getLogoFromUrl(imgBitCloutUrl)
    const image = stack.addImage(imgBitclout)
    image.imageSize = new Size(60, 20)
    stack.addSpacer(1)

    const title = stack.addText("Price ~$" + actUsdPrice.toFixed(2));
    title.textColor = Color.white();
    title.textOpacity = 0.8;
    title.font = new Font("Helvetica-Light ", 12);
    stack.addSpacer(1)

    const date = new Date();
    const lastUpdate = stack.addText(`LastUpdate: ${date.getHours()}:${date.getMinutes()}`);
    lastUpdate.textColor = Color.white();
    title.textOpacity = 0.8;
    lastUpdate.font = new Font("Helvetica-Light", 12);
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
