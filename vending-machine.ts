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
