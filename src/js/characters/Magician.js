import Character from '../Character';

export default class Magician extends Character {
  constructor(level) {
    super(level, 'magician');
    this.attack = 10;
    this.defence = 40;
    this.moveDistance = 1;
    this.attackRadius = 4;
    this.health = 100;

    for (let i = 1; i < level; i += 1) {
      this.levelUp();
    }
  }
}
