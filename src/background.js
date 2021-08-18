// port placeholder
let c_port = null;

// store interval
// eslint-disable-next-line no-unused-vars
let getInterval = null;

// interval to get new values, 31s to avoid 30s cache imposed in this free api
const GET_INTERVAL_MS = 31000;

function setBidTagValue(bidValue) {
  const decimalLimitedValue = bidValue.toFixed(2);
  chrome.browserAction.setBadgeText({ text: "" + decimalLimitedValue });
}

async function getMonetaryData() {
  await fetch(
    "https://economia.awesomeapi.com.br/last/USD-BRL?ts=" + Date.now(),
    {
      cache: "reload",
    }
  ).then((response) =>
    response.json().then((data) => {
      const bidValue = parseFloat(data.USDBRL.bid);
      setBidTagValue(bidValue);

      // Update bid value on popup script
      c_port && c_port.postMessage(bidValue);
    })
  );
}

// onConnect listener
chrome.extension.onConnect.addListener(function (port) {
  // Update the bid value from popup if received
  port.onMessage.addListener(function (value) {
    setBidTagValue(value);
  });

  // On connect, update port reference
  c_port = port;

  // Add listener for onDisconnect, to avoid using disconnected port
  port.onDisconnect.addListener(function () {
    c_port = null;
  });
});

// on Installed first run
chrome.runtime.onInstalled.addListener(() => {
  // First get
  getMonetaryData();

  // Interval loop
  getInterval = setInterval(() => {
    try {
      getMonetaryData();
    } catch (error) {
      console.log(error);
    }
  }, GET_INTERVAL_MS);
});

// Add startup listener
chrome.runtime.onStartup.addListener(() => {
  // First get
  getMonetaryData();

  // Interval loop
  getInterval = setInterval(() => {
    try {
      getMonetaryData();
    } catch (error) {
      console.log(error);
    }
  }, GET_INTERVAL_MS);
});
