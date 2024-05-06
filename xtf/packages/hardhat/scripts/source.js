let category = args[0];

const apiResponse = await Functions.makeHttpRequest({
  url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc`,
});

if (apiResponse.error) {
  throw new Error("Request failed");
}

let symbols = "";

for (i = 0; i < 30; i++) {
  symbols += "," + apiResponse.data[i].symbol;
  // console.log(apiResponse.data[i].id)
}
symbols = symbols.substring(1);

console.log(symbols);
return Functions.encodeString();
