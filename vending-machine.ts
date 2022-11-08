import process from 'node:process';
import fs from 'node:fs';

type Coin = {
  name: string,
  value: number,
}

type Currency = {
  abbreviation: string,
  coins: ReadonlyArray<Coin>,
  format: string,
}

/*
 * Load currencies file. './currencies.json' contains an array of currency definitions for supported currencies.
 */

function loadCurrencies(path: string): ReadonlyArray<Currency> {
  const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
  // FIXME: It would be nice to make this type safe.
  return data as ReadonlyArray<Currency>;
}

const currencies = loadCurrencies('./currencies.json');

/*
 * Parse command line arguments. The script requires two arguments:
 *     --item-cost <item_cost>
 *     --payment <payment_amount>
 *
 *  Both <item_cost> and <payment_amount> are expected to be in dollar amounts.
 */

let currencyCode: string | undefined = 'USD';
let costInDollars: number | undefined;
let paymentInDollars: number | undefined;
let help = false;

let arg: string | undefined;
while ((arg = process.argv.shift()) !== undefined) {
  switch (arg) {
  case '--item-cost': {
    const costInput = process.argv.shift();
    costInDollars = Number(costInput);
    if (!costInDollars) {
      console.error(`Unable to parse '${costInput}' as item_cost.`);
      process.exit(1);
    }
    break;
  }
  case '--payment': {
    const paymentInput = process.argv.shift();
    paymentInDollars = Number(paymentInput);
    if (!paymentInDollars) {
      console.error(`Unable to parse '${paymentInput}' as payment_amount.`);
      process.exit(1);
    }
    break;
  }
  case '--currency': {
    currencyCode = process.argv.shift();
    if (!currencyCode) {
      console.error(`Unable to parse '${currencyCode}' as currency_code`);
      process.exit(1);
    }
    break;
  }
  case '--help':
  case '-h':
    help = true;
    break;
  }
}

const currency = currencies.find(c => c.abbreviation === currencyCode);

if (!costInDollars || !paymentInDollars || !currency || help) {
  // FIXME: I don't think this conforms to the POSIX spec that was suggested.
  console.log('Usage:');
  console.log('  vending-machine --item-cost <item_cost> --payment <payment_amount>');
  console.log('Options:');
  console.log('  --item-cost: cost of item in dollars');
  console.log('  --payment:   payment amount in dollars');
  process.exit(1);
}

/*
 *  Main program logic.
 *
 *  From here on all currency amounts should be in pennies.
 */

type ChangeInstructions = ReadonlyArray<{ coin: Coin, count: number }>;

function makeChange(amount: number, currency: Currency): ChangeInstructions {
  // NOTE: These coins start in sorted descending order.
  const coinsInOrderOfDescendingValue = Array.from(currency.coins).sort((a, b) => b.value - a.value);

  // This greedy algorithm is only correct because the US coinage system is "canonical". If this program is expanded to
  // consider arbitrary coinage systems, this algorithm will need to be changed.
  const changeInstructions: Array<{ coin: Coin, count: number}> = [];
  let changeRemaining = amount;
  for (const coin of coinsInOrderOfDescendingValue) {
    let count = 0;
    while (changeRemaining >= coin.value) {
      count++;
      changeRemaining -= coin.value;
    }
    if (count > 0) changeInstructions.push({ coin, count: count });
  }
  return changeInstructions;
}

const cost = Math.floor(costInDollars * 100);
const payment = Math.floor(paymentInDollars * 100);
const change = payment - cost;

if (change < 0) {
  console.error('Payment is less than cost!');
  process.exit(1);
}

const changeInstructions = makeChange(change, currency);

const longestCoinName = changeInstructions.reduce((max, step) => Math.max(step.coin.name.length, max), Number.MIN_VALUE);
for (const step of changeInstructions) {
  console.log(`${(step.coin.name + ':').padEnd(longestCoinName + 1)} ${step.count}`);
}
console.log(`Total Change: ${currency.format.replace('<AMOUNT>', (change / 100).toString())}`);
