import Character from '../Character';

export default class Vampire extends Character {
  constructor(level) {
    super(level, 'vampire');
    this.attack = 25;
    this.defence = 25;
    this.moveDistance = 2;
    this.attackRadius = 2;
    this.health = 100;
  }
}
