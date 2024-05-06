let category = args[0];

function normalizeValues(value) {
  const scaledValue = value * 1000;
  const logValue = Math.log10(scaledValue + 1);
  const normalized = Math.ceil((logValue / 3) * 1000);
  return Math.max(1, Math.min(1000, normalized));
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

for (i = 0; i < 30; i++) {
  symbols += "," + normalizeValues(Number(apiResponse.data[i].market_cap) / totalMarketCap);
}

symbols += "|" + totalMarketCap;

console.log(symbols);
return Functions.encodeString();


// btc,eth,usdt,bnb,sol,usdc,xrp,steth,doge,ton,ada,shib,avax,trx,wbtc,dot,bch,link,near,matic,ltc,icp,fet,uni,leo,dai,hbar,etc,apt,rndr|,920,745,573,544,504,405,392,385,352,339,310,293,292,255,248,248,242,232,222,204,193,193,192,187,181,181,153,152,149,148|2170086872214
