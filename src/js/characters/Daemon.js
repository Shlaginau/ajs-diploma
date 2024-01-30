import Character from '../Character';

export default class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 10;
    this.health = 100;

    for (let i = 1; i < level; i += 1) {
      this.levelUp();
    }
  }
}
