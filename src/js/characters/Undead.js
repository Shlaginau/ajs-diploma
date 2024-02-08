import Character from '../Character';

export default class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.moveDistance = 4;
    this.attackRadius = 1;
    this.health = 100;

    for (let i = 1; i < level; i += 1) {
      this.levelUp();
    }
  }
}
