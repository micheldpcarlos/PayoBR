
let bidValue = 0;

function formatNumber(number) {
  // Payoneer is rounding down it's last decimal (STRONKS)
  return Math.floor(number * 10000) / 10000
}

function UIsetDollarValue(){
  const dollarEl = document.getElementById("dollar");
  dollarEl.innerHTML = formatNumber(bidValue);
}

function UIsetPayoneerValue(){
  const pDollarEl = document.getElementById("p-dollar");
  pDollarEl.innerHTML = formatNumber(bidValue * 0.98);
}

function UIsetSimulation(value){
   const pDollarValue = formatNumber(bidValue * 0.98);
   const realValue = pDollarValue * value;

   const resultEl = document.getElementById("result");
   resultEl.innerHTML = realValue.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
}

async function getMonetaryData(){
 await fetch('https://economia.awesomeapi.com.br/last/USD-BRL').then(response => response.json().then(data => {
  bidValue = parseFloat(data.USDBRL.bid)

  UIsetDollarValue();
  UIsetPayoneerValue();
}))
}

document.addEventListener('DOMContentLoaded', function() {

  getMonetaryData().then(() => {
    UIsetSimulation(50);
  });
  
  const inputEl = document.querySelector("input");

  inputEl.addEventListener("keydown", function(event) {
    const code = (event.which) ? event.which : event.keyCode;
    
    console.log(code);
    if (code > 31 && (code < 48 || code > 57) && code !== 37 && code != 39 && code != 46) {
      event.preventDefault();
    }
  });
  
  let timer = null
  inputEl.addEventListener("input", function(event){

  clearTimeout(timer);
  timer = setTimeout(function(){
    getMonetaryData().then(() => {
      UIsetSimulation(event.target.value);
    });
  }, 500);
});

}, false);