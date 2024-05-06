let category = args[0];

function normalizeValues(value) {
  const scaledValue = value * 1000;
  const logValue = Math.log10(scaledValue + 1);
  const normalized = Math.ceil((logValue / 3) * 1000);
  return Math.max(1, Math.min(1000, normalized));
}

function calculateQuantities(prices, percentages) {
  const normalizedScores = percentages.map(p => normalizeValues(p));
  const totalScore = normalizedScores.reduce((acc, score) => acc + score, 0);
  const initialQuantities = normalizedScores.map(score => (score / totalScore) * 1000);

  const totalFunds = 10000;
  let adjustedQuantities = prices.map((price, index) => (totalFunds / price) * (initialQuantities[index] / totalScore));
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

for (i = 0; i < 30; i++) {
  symbols += "," + apiResponse.data[i].symbol;
  totalMarketCap += Number(apiResponse.data[i].market_cap);
  // console.log(apiResponse.data[i].id)
}

symbols = symbols.substring(1) + "|";

percentages = [];
prices = [];

for (i = 0; i < 30; i++) {
  // symbols += "," + normalizeValues(Number(apiResponse.data[i].market_cap)/totalMarketCap);
  prices.push(apiResponse.data[i].current_price);
  percentages.push(Number(apiResponse.data[i].market_cap) / totalMarketCap);
}

console.log(calculateQuantities(prices, percentages));

symbols += "|" + totalMarketCap;

// console.log(symbols)
return Functions.encodeString();

// 0.0000011915843605829242,0.000019860623600253842,0.04679379768836256,0.0000755775103210768,0.0002706872082191605,0.03306789116637308,0.05863768134242098,0.000010265624484838782,0.18549493385437457,0.004766136686270948,0.05515463154515968,999.2699620441017,0.0006442370203192223,0.17509138578970726,3.212811395035902e-7,0.0028205078557954648,0.000041812387060762245,0.0012948890473947383,0.0024832488021504675,0.023298499969339564,0.0001942494772262684,0.0012143590003759462,0.006634130560761121,0.0020304694428783126,0.0025447514460620693,0.014785032999017308,0.10964523311624583,0.00045636109220748754,0.001345529756359612,0.0012202820200658516