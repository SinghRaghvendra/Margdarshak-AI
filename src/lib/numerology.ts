
/**
 * @fileOverview Utility functions for numerology calculations.
 * - calculateLifePathNumber - Calculates the Life Path Number from a date of birth.
 */

function sumDigits(numStr: string): number {
  let sum = 0;
  for (const digit of numStr) {
    sum += parseInt(digit, 10);
  }
  return sum;
}

function reduceToSingleDigitOrMaster(num: number): number {
  // Keep reducing until the number is a single digit or a master number (11, 22, 33)
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = sumDigits(num.toString());
  }
  return num;
}

export function calculateLifePathNumber(dateOfBirth: string): number {
  // Expected dateOfBirth format: "YYYY-MM-DD"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    throw new Error("Invalid dateOfBirth format. Expected YYYY-MM-DD.");
  }

  const [yearStr, monthStr, dayStr] = dateOfBirth.split('-');

  // Reduce year
  const yearNum = parseInt(yearStr, 10);
  const reducedYear = reduceToSingleDigitOrMaster(yearNum);

  // Reduce month
  const monthNum = parseInt(monthStr, 10);
  const reducedMonth = reduceToSingleDigitOrMaster(monthNum);

  // Reduce day
  const dayNum = parseInt(dayStr, 10);
  const reducedDay = reduceToSingleDigitOrMaster(dayNum);

  // Sum the reduced components
  const totalSum = reducedYear + reducedMonth + reducedDay;

  // Reduce the final sum
  return reduceToSingleDigitOrMaster(totalSum);
}
