import process from 'node:process';

/*
 * Parse command line arguments. The script requires two arguments:
 *     --item-cost <item_cost>
 *     --payment <payment_amount>
 *
 *  Both <item_cost> and <payment_amount> are expected to be in dollar amounts.
 */

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
    case '--help':
    case '-h':
      help = true;
      break;
  }
}

if (!costInDollars || !paymentInDollars || help) {
  // FIXME: I don't think this conforms to the POSIX spec that was suggested.
  console.log('Usage:');
  console.log('  vending-machine --item-cost <item_cost> --payment <payment_amount>')
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

function makeChange(amount: number): Array<[string, number]> {
  // NOTE: These coins start in sorted descending order.
  const coins: Array<[string, number]> = [['Quarter', 25], ['Dime', 10], ['Nickel', 5], ['Penny', 1]];

  // This greedy algorithm is only correct because the US coinage system is "canonical". If this program is expanded to
  // consider arbitrary coinage systems, this algorithm will need to be changed.
  const changeInstructions: Array<[string, number]> = [];
  let changeRemaining = change;
  for (const [coinName, coinAmount] of coins) {
    let coinCount = 0;
    while (changeRemaining >= coinAmount) {
      coinCount++;
      changeRemaining -= coinAmount;
    }
    if (coinCount > 0) changeInstructions.push([coinName, coinCount]);
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

const changeInstructions = makeChange(change);

const longestCoinName = changeInstructions.reduce((max, c) => Math.max(c[0].length, max), Number.MIN_VALUE);
for (const [coinName, coinCount] of changeInstructions) {
  console.log(`${(coinName + ':').padEnd(longestCoinName + 1)} ${coinCount}`);
}
console.log(`Total Change: ${change / 100} USD`);
