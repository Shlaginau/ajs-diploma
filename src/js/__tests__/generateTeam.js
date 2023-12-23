import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Character from '../Character';

test('Character creation exception', () => {
  expect(() => new Character(1)).toThrow();
  expect(() => new Bowman(1)).not.toThrow();
  expect(() => new Swordsman(1)).not.toThrow();
  expect(() => new Magician(1)).not.toThrow();
  expect(() => new Vampire(1)).not.toThrow();
  expect(() => new Undead(1)).not.toThrow();
  expect(() => new Daemon(1)).not.toThrow();
});

test('Character attributes at level 1', () => {
  const allowedTypes = [Bowman, Swordsman, Magician, Vampire, Undead, Daemon];
  const maxLevel = 1;
  const characterCount = 1;

  const team = generateTeam(allowedTypes, maxLevel, characterCount);
  const character = team[0];

  expect(character.level).toBe(1);
});

test('Character generator produces characters infinitely', () => {
  const allowedTypes = [Bowman, Swordsman, Magician, Vampire, Undead, Daemon];
  const maxLevel = 1;
  const generator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < 1000; i += 1) {
    expect(generator.next().value).toBeDefined();
  }
});
