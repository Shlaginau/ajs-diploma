export default class GameState {
  constructor() {
    this.isUsersTurn = true;
    this.level = 1;
    this.allPositions = [];
    this.points = 0;
    this.statistics = [];
    this.selected = null;
  }

  static from(object) {
    const gameState = new GameState();
    Object.assign(gameState, object);
    return gameState;
  }

  setSelectedIndex(index) {
    this.selected = index;
  }

  setLevel(level) {
    this.level = level;
  }

  addPoints(points) {
    this.points += points;
  }
}

export const MAX_LEVEL = 4;
