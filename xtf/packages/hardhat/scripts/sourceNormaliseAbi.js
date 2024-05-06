let category = args[0];
const { ethers } = await import("npm:ethers@6.10.0"); // Import ethers.js v6.10.0

const abiCoder = ethers.AbiCoder.defaultAbiCoder();

function normalizeValues(value) {
  const scaledValue = value * 1000;
  const logValue = Math.log10(scaledValue + 1);
  const normalized = Math.ceil((logValue / 3) * 1000);
  return Math.max(1, Math.min(1000, normalized));
}

function toBasisPoints(normalizedScores) {
  const totalScore = normalizedScores.reduce((acc, score) => acc + score, 0);
  return normalizedScores.map(score => (score / totalScore) * 10000);
}

function calculateQuantities(prices, percentages) {
  const normalizedScores = percentages.map(p => normalizeValues(p));
  const bps = toBasisPoints(normalizedScores);
  const totalFunds = 10000;
  let adjustedQuantities = prices.map((price, index) => (totalFunds / price) * (bps[index] / 10000));
  const sumAdjustedQuantities = adjustedQuantities.reduce((acc, qty) => acc + qty, 0);
  const finalQuantities = adjustedQuantities.map(qty => (qty / sumAdjustedQuantities) * 1000);

  return finalQuantities;
}

const apiResponse = await Functions.makeHttpRequest({
  url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc`,
});

if (apiResponse.error) {
  throw new Error("Request failed");
}

let symbols = "";
let totalMarketCap = 0;

for (let i = 0; i < 30; i++) {
  symbols += "," + apiResponse.data[i].symbol;
  totalMarketCap += Number(apiResponse.data[i].market_cap);
}

symbols = symbols.substring(1) + "|";

let percentages = [];
let prices = [];
let bps = [];

for (let i = 0; i < 30; i++) {
  prices.push(apiResponse.data[i].current_price);
  percentages.push(Number(apiResponse.data[i].market_cap) / totalMarketCap);
}

bps = toBasisPoints(percentages.map(p => normalizeValues(p)));



const types = ["uint256", "string", "uint256[]"];
const encodedData = abiCoder.encode(types, [totalMarketCap, symbols, bps]);

console.log(encodedData);
console.log(complexData);

return ethers.getBytes(encodedData);
