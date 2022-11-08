import process from 'node:process';
import fs from 'node:fs';

// Types
type Coin = {
  name: string,
  value: number,
}
type Currency = {
  abbreviation: string,
  coins: ReadonlyArray<Coin>,
  format: string,
}
type VendingMachineOptions = {
  currency: Currency,
  cost: number,
  payment: number,
}
type ChangeStep = {
  coin: Coin,
  count: number
}
type ChangeInstructions = ReadonlyArray<ChangeStep>;

// Helper functions
function loadCurrencies(path: string): ReadonlyArray<Currency> {
  const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
  // FIXME: It would be nice to make this type safe.
  return data as ReadonlyArray<Currency>;
}

function parseArgs(currencies: ReadonlyArray<Currency>): VendingMachineOptions {
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
    console.log('  vending-machine --item-cost <item_cost> --payment <payment_amount> [--currency <currency_code>]');
    console.log('Options:');
    console.log('  --item-cost: cost of item in dollars');
    console.log('  --payment:   payment amount in dollars');
    console.log('  --currency:  currency ISO 4217 code');
    process.exit(1);
  }

  return {
    currency,
    cost: Math.floor(costInDollars * 100),
    payment: Math.floor(paymentInDollars * 100)
  };
}

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

function printChangeInstructions(instructions: ChangeInstructions): void {
  const longestCoinName = instructions.reduce((max, step) => Math.max(step.coin.name.length, max), Number.MIN_VALUE);
  for (const step of instructions) {
    console.log(`${(step.coin.name + ':').padEnd(longestCoinName + 1)} ${step.count}`);
  }
  console.log(`Total Change: ${currency.format.replace('<AMOUNT>', (change / 100).toString())}`);
}

// Main program logic
const currencies = loadCurrencies('./currencies.json');
const { currency, cost, payment } = parseArgs(currencies);
const change = payment - cost;

if (change < 0) {
  console.error('Payment is less than cost!');
  process.exit(1);
}

const changeInstructions = makeChange(change, currency);
printChangeInstructions(changeInstructions);
