/**
 * @file
 * This file contains functions that handle loading currency definitions from a json file. The structure of the
 * expected json file is as follows:
 * [
 *   {
 *     "abbreviation": "USD",
 *     "format": "$<AMOUNT>",
 *     "divisor": 100,
 *     "coins": [
 *       {
 *         "name": "Quarter",
 *         "value": 25
 *       },
 *       ...other coins
 *       {
 *         "name": "Penny",
 *         "value": 1
 *       }
 *     ]
 *   },
 *   ...other currencies
 * ]
 *
 * The 'format' field is used when displaying quantities of the given currency and should include the currency's glyph
 * and an <AMOUNT> placeholder.
 */
import fs from 'node:fs';
import { Currency } from './types';

/**
 * Loads a currency definitions json file.
 *
 * @param {string} path - The path a currency definitions json file.
 * @returns The parsed json file.
 */
export function loadCurrencies(path: string): ReadonlyArray<Currency> {
  const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
  // FIXME: It would be nice to make this type safe.
  return data as ReadonlyArray<Currency>;
}

/**
 * Finds and returns the currency object corresponding to the passed currency code in the currency array. If no
 * corresponding currency is found, returns undefined.
 *
 * @param {Currency} currencies
 * @param {string} currencyCode
 * @returns The currency object or undefined.
 */
export function getCurrency(currencies: ReadonlyArray<Currency>, currencyCode: string): Currency | undefined {
  return currencies.find(c => c.abbreviation === currencyCode);
}
