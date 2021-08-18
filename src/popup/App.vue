<template>
  <div class="content">
    <i class="gg-sync"></i>
    <div class="header orange-bg">
      <h1 class="title">USD <i class="gg-arrow-right-o"></i> BRL</h1>
      <div class="currency-wrapper">
        <div class="currency">
          <div class="currency-title">DOLLAR</div>
          <div class="currency-value" id="dollar">0.0000</div>
        </div>
        <div class="separator"></div>
        <div class="currency">
          <div class="currency-title">PAYONEER</div>
          <div class="currency-value" id="p-dollar">0.0000</div>
        </div>
      </div>
    </div>
    <div class="body">
      <h1 class="title title-sm">SIMULATE</h1>
      <div class="amount">
        <label for="input" class="amount-input-label">Amount:</label>
        <input type="number" id="input" class="amount-input" value="50" />
      </div>
      <div class="result">
        <label for="input" class="amount-input-label">Result:</label>
        <span class="result-value" id="result"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
};

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
    syncButton.addEventListener("click", function () {
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
</script>

<style>
html {
  width: 400px;
  height: 300px;
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.orange-bg {
  background: #fa713b;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to bottom, #fa713b, #f17a3e);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to bottom, #fa713b, #f17a3e);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.content .header {
  height: 140px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 0 7px 30px -10px rgba(150, 170, 180, 0.5);
  color: #fff;
}

.content .body {
  height: 40%;
  background: transparent;
  padding: 0 16px 16px;
  color: #262626;
}

.title {
  font-size: 20px;
  font-weight: 200;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title > i {
  transform: scale(0.7);
  margin: 0 6px;
}

.title-sm {
  font-size: 14px;
  font-weight: 500;
  margin: 10px 0;
}

.currency-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.separator {
  width: 1px;
  background: #fff;
}

.currency {
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.currency-title {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.currency-value {
  font-size: 16px;
  font-weight: 500;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.amount {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.amount input {
  text-align: right;
  max-width: 100px;
}

.result {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-content: space-between;
}

.loader-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: none;
  pointer-events: none;
}

.loader-wrapper.disabled {
  transition: all 300ms ease-in-out;
  opacity: 0;
}

/* Icons from css.gg */

/* Arrow Right Icon */
.gg-arrow-right-o {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 2px solid;
  transform: scale(var(--ggs, 1));
  border-radius: 20px;
}

.gg-arrow-right-o::after,
.gg-arrow-right-o::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  right: 4px;
}

.gg-arrow-right-o::after {
  width: 6px;
  height: 6px;
  border-top: 2px solid;
  border-right: 2px solid;
  transform: rotate(45deg);
  bottom: 6px;
}

.gg-arrow-right-o::before {
  width: 10px;
  height: 2px;
  bottom: 8px;
  background: currentColor;
}

/* Sync Icon */
.gg-sync {
  box-sizing: border-box;
  display: block;
  border-radius: 40px;
  border: 2px solid;
  margin: 1px;
  border-left-color: transparent;
  border-right-color: transparent;
  width: 18px;
  height: 18px;
  /* custom styles */
  position: absolute;
  color: white;
  cursor: pointer;
  right: 6px;
  top: 6px;
  transform: scale(0.6);
}
.gg-sync::after,
.gg-sync::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transform: rotate(-45deg);
}
.gg-sync::before {
  border-left: 6px solid;
  bottom: -1px;
  right: -3px;
}
.gg-sync::after {
  border-right: 6px solid;
  top: -1px;
  left: -3px;
}
.gg-sync:hover:not(:active) {
  transform: scale(0.7);
}

.gg-sync.loading {
  animation-name: spin;
  animation-duration: 5000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: scale(0.6) rotate(0deg);
  }
  to {
    transform: scale(0.6) rotate(-360deg);
  }
}
</style>
