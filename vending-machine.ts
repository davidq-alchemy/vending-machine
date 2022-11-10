/**
 * @file
 * vending-machine is a command line utility for making change. It takes two required arguments the payment amount
 * (--payment) and the cost (--item-cost), and prints a nice set of instructions for making change. The default currency
 * is USD but other currencies can be specified by their ISO 4217 code with the --currency option. To add support for
 * more currencies, add a currency definition to the currencies.json file in the root of this repository.
 */
import process from 'node:process';
import {
  Coin,
  Currency,
  VendingMachineOptions,
  ChangeInstructions
} from './types';
import { getCurrency, loadCurrencies } from './currencies.js';

/**
 * Parses the command line arguments from process.argv and returns a VendingMachineOptions.
 *
 * Note that this function will process.exit with a (hopefully) helpful error message if the arguments aren't valid.
 * Also note that to determine if the passed currency argument is valid this function requires an array of valid
 * currencies. See ./currencies.ts for how to accomplish that.
 *
 * @param currencies - An array of supported currencies.
 * @returns {void}
 */
function parseArgs(currencies: ReadonlyArray<Currency>): VendingMachineOptions {
  let currencyCode: string | undefined = 'USD';
  let cost: number | undefined;
  let payment: number | undefined;
  let help = false;

  let arg: string | undefined;
  while ((arg = process.argv.shift()) !== undefined) {
    switch (arg) {
    case '--item-cost': {
      const costInput = process.argv.shift();
      cost = Number(costInput);
      if (!cost) {
        console.error(`Unable to parse '${costInput}' as item_cost.`);
        process.exit(1);
      }
      break;
    }
    case '--payment': {
      const paymentInput = process.argv.shift();
      payment = Number(paymentInput);
      if (!payment) {
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

  const currency = getCurrency(currencies, currencyCode);
  if (!currency) {
    console.error(`Unable to find currency definition for code ${currencyCode}`);
    process.exit(1);
  }

  if (!cost || !payment || !currency || help) {
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
    cost: Math.floor(cost * currency.divisor),
    payment: Math.floor(payment * currency.divisor)
  };
}

/**
 * Makes change for the given amount in the given currency.
 *
 * The algorithm implemented here is the greedy solution to this problem, which means it won't always tender the minimum
 * number of coins for an arbitrary coinage system. Thankfully, most real world coinage systems are "canonical", which
 * means, within that coinage system, the greedy and optimal solutions always give the same result.
 *
 * @param {number} amount - The total of value of change that needs to be tendered.
 * @param {Currency} currency - The currency to make change in.
 * @returns {ChangeInstructions} The instructions for making change.
 */
function makeChange(amount: number, currency: Currency): ChangeInstructions {
  const coinsInOrderOfDescendingValue = Array.from(currency.coins).sort((a, b) => b.value - a.value);

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

/**
 * Prints a ChangeInstructions object to the console with nice formatting.
 *
 * @param {ChangeInstructions} instructions
 * @param {Currency} currency
 */
function printChangeInstructions(instructions: ChangeInstructions, currency: Currency): void {
  const longestCoinName = instructions.reduce((max, step) => Math.max(step.coin.name.length, max), Number.MIN_VALUE);
  for (const step of instructions) {
    console.log(`${(step.coin.name + ':').padEnd(longestCoinName + 1)} ${step.count}`);
  }
  console.log(`Total Change: ${currency.format.replace('<AMOUNT>', (change / currency.divisor).toString())}`);
}

//-------------------------------------------------------------------
// Main program logic
//-------------------------------------------------------------------
const currencies = loadCurrencies('./currencies.json');
const { currency, cost, payment } = parseArgs(currencies);
const change = payment - cost;

if (change < 0) {
  console.error('Payment is less than cost!');
  process.exit(1);
}

const changeInstructions = makeChange(change, currency);
printChangeInstructions(changeInstructions, currency);
