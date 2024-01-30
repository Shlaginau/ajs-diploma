/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Impossible to create a new Character');
    }

    this.level = 1;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
  }

  levelUp() {
    this.level += 1;
    this.attack = Number(Math.max(this.attack, this.attack * (0.8 + this.health / 100)).toFixed(0));
    // eslint-disable-next-line max-len
    this.defence = Number(Math.max(this.defence, this.defence * (0.8 + this.health / 100).toFixed(0)));
    this.health = Number(Math.min(this.health + 80, 100).toFixed(0));
  }
}
