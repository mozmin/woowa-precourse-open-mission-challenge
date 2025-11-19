import { describe, it, expect } from 'vitest';
import { parseCarNames, parseAttempts, simulateRace } from '../racingCore';

const createRandomFromInts = (ints) => {
  let index = 0;
  return () => {
    const value = ints[index % ints.length];
    index += 1;
    return value / 10;
  };
};

describe('racingCore', () => {
  it('parses car names separated by commas', () => {
    expect(parseCarNames('pobi, crong')).toEqual(['pobi', 'crong']);
  });

  it('parses attempt counts within bounds', () => {
    expect(parseAttempts('3')).toBe(3);
  });

  it('simulates race history and winners deterministically', () => {
    const randomFn = createRandomFromInts([9, 3, 8, 1, 5, 6]);
    const result = simulateRace(['pobi', 'crong'], 3, randomFn);

    expect(result.history).toHaveLength(3);
    result.history.forEach((round) => {
      expect(round.states).toHaveLength(2);
    });
    expect(result.winners).toEqual(['pobi']);
    expect(result.maxDistance).toBeGreaterThan(0);
  });
});
