import fs from 'node:fs';
import { Currency } from './types';

export function loadCurrencies(path: string): ReadonlyArray<Currency> {
  const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
  // FIXME: It would be nice to make this type safe.
  return data as ReadonlyArray<Currency>;
}

export function getCurrency(currencies: ReadonlyArray<Currency>, currencyCode: string): Currency | undefined {
  return currencies.find(c => c.abbreviation === currencyCode);
}
