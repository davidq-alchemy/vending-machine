import process from 'node:process';

/*
 * Parse command line arguments. The script requires two arguments:
 *     --item-cost <item_cost>
 *     --payment <payment_amount>
 *
 *  Both <item_cost> and <payment_amount> are expected to be in dollar amounts.
 */

let cost: number | undefined;
let payment: number | undefined;

let arg: string | undefined;
while ((arg = process.argv.shift()) !== undefined) {
  switch (arg) {
    case '--item-cost': {
      const costInput = process.argv.shift();
      cost = parseInt(costInput || '0');
      break;
    }
    case '--payment': {
      const paymentInput = process.argv.shift();
      payment = parseInt(paymentInput || '0');
      break;
    }
  }
}

if (!cost || !payment) {
  // FIXME: I don't think this is conforms to the POSIX spec that was suggested.
  console.log('Usage:');
  console.log('  vending-machine --item-cost <item_cost> --payment <payment_amount>')
  console.log('Options:');
  console.log('  --item-cost: cost of item in dollars');
  console.log('  --payment:   payment amount in dollars');
  process.exit(1);
}
