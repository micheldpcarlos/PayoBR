let bidValue = 0;
let simulationValue = 50;

// Create port for comunication with bg script
const BG_PORT = chrome.extension.connect({
  name: "BID_BG_CONNECTION",
});

function formatNumber(number) {
  // Payoneer is rounding down it's last decimal (STRONKS)
  return Math.floor(number * 10000) / 10000;
}

function UIsetDollarValue() {
  const dollarEl = document.getElementById("dollar");
  dollarEl.innerHTML = formatNumber(bidValue);
}

function UIsetPayoneerValue() {
  const pDollarEl = document.getElementById("p-dollar");
  pDollarEl.innerHTML = formatNumber(bidValue * 0.98);
}

function UIsetSimulation() {
  const pDollarValue = formatNumber(bidValue * 0.98);
  const realValue = pDollarValue * simulationValue;

  const resultEl = document.getElementById("result");
  resultEl.innerHTML = realValue.toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });
}

async function getMonetaryData() {
  const syncButton = document.querySelector(".gg-sync");
  syncButton.classList.add("loading");
  await fetch(
    "https://economia.awesomeapi.com.br/last/USD-BRL?ts=" + Date.now(),
    {
      cache: "reload",
    }
  ).then(async (response) => {
    syncButton.classList.remove("loading");
    await response.json().then(async (data) => {
      bidValue = await parseFloat(data.USDBRL.bid);

      UIsetDollarValue();
      UIsetPayoneerValue();

      // Update bid value on bg script
      BG_PORT.postMessage(bidValue);
    });
  });
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    getMonetaryData().then(() => {
      UIsetSimulation();
    });

    // Sync Button Click
    const syncButton = document.querySelector(".gg-sync");
    syncButton.addEventListener("click", function (event) {
      getMonetaryData().then(() => {
        UIsetSimulation();
      });
    });

    // Input update events
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keypress", function (event) {
      const regex = new RegExp("^[0-9]+$");
      const isNumber = regex.test(event.key);

      if (!isNumber) event.preventDefault();
    });

    let timer = null;
    inputEl.addEventListener("input", function (event) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        getMonetaryData().then(() => {
          simulationValue = event.target.value;
          UIsetSimulation();
        });
      }, 500);
    });

    // Add listener to background bid update
    BG_PORT.onMessage.addListener(function (value) {
      bidValue = value;
      UIsetDollarValue();
      UIsetPayoneerValue();
    });
  },
  false
);
