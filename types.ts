export type Coin = {
  name: string,
  value: number,
}

export type Currency = {
  abbreviation: string,
  coins: ReadonlyArray<Coin>,
  format: string,
  divisor: number,
}

export type VendingMachineOptions = {
  currency: Currency,
  cost: number,
  payment: number,
}

export type ChangeStep = {
  coin: Coin,
  count: number
}

export type ChangeInstructions = ReadonlyArray<ChangeStep>;
