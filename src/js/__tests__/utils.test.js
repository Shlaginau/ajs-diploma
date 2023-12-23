import { calcTileType, calcHealthLevel } from '../utils';

test('returns required tile type', () => {
  expect(calcTileType(0, 8)).toBe('top-left');
  expect(calcTileType(7, 8)).toBe('top-right');
  expect(calcTileType(2, 4)).toBe('top');
  expect(calcTileType(32, 8)).toBe('left');
  expect(calcTileType(47, 8)).toBe('right');
  expect(calcTileType(45, 8)).toBe('center');
  expect(calcTileType(56, 8)).toBe('bottom-left');
  expect(calcTileType(63, 8)).toBe('bottom-right');
  expect(calcTileType(60, 8)).toBe('bottom');
});

test('returns health level', () => {
  expect(calcHealthLevel(10)).toBe('critical');
  expect(calcHealthLevel(30)).toBe('normal');
  expect(calcHealthLevel(90)).toBe('high');
});
