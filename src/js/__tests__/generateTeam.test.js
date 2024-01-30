import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Character from '../Character';
import Team from '../Team';

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

test('add character to the team', () => {
  const team = new Team();
  const character = new Bowman(1);
  team.add(character);
  expect(team.toArray()).toContain(character);
});

test('add the same character twice throws an error', () => {
  const team = new Team();
  const character = new Bowman(1);
  team.add(character);
  expect(() => team.add(character)).toThrow();
});

test('delete a character from the team', () => {
  const team = new Team();
  const character = new Bowman(1);
  team.add(character);
  team.delete(character);
  expect(team.toArray()).not.toContain(character);
});

test('convert team to array', () => {
  const team = new Team();
  const characters = [new Bowman(1), new Swordsman(1)];
  team.addAll(characters);
  expect(team.toArray()).toEqual(expect.arrayContaining(characters));
});

test('Team iterator works correctly', () => {
  const team = new Team();
  const characters = [new Bowman(1), new Swordsman(1), new Magician(1)];
  team.addAll(characters);

  const iteratedCharacters = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const character of team) {
    iteratedCharacters.push(character);
  }

  expect(iteratedCharacters).toEqual(expect.arrayContaining(characters));
});
