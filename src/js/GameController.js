import GamePlay from './GamePlay';
import GameState from './GameState';
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Team from './Team';
import { generateTeam } from './generators';

import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();

    this.playerCharacters = [Bowman, Swordsman, Magician];
    this.opponentCharacters = [Vampire, Undead, Daemon];
    this.playerTeam = new Team();
    this.opponentTeam = new Team();
    this.playerPositions = [];
    this.opponentPositions = [];
    this.onNewGameClick = this.onNewGameClick.bind(this);
    this.onNewGameClick = this.onNewGameClick.bind(this);
    this.onSaveGameClick = this.onSaveGameClick.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
  }

  init() {
    const themeName = themes.find((item) => item.level === 1).name;
    this.gamePlay.drawUi(themeName);

    this.playerTeam = new Team();
    this.opponentTeam = new Team();
    this.playerTeam.addAll(generateTeam(this.playerCharacters, 1, 2));
    this.opponentTeam.addAll(generateTeam(this.opponentCharacters, 1, 2));
    this.teamsPosition(this.playerTeam, this.calculatePlayerPositions());
    this.teamsPosition(this.opponentTeam, this.calculateOpponentPositions());

    this.gamePlay.addNewGameListener(this.onNewGameClick);
    this.gamePlay.addSaveGameListener(this.onSaveGameClick);
    this.gamePlay.addLoadGameListener(this.onLoadGameClick);

    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);

    this.gamePlay.redrawPositions(this.gameState.allPositions);
  }

  calculatePlayerPositions() {
    const gamingSpace = this.gamePlay.boardSize;
    const playerPosition = [];
    for (let row = 0; row < gamingSpace; row += 1) {
      playerPosition.push(row * gamingSpace, row * gamingSpace + 1);
    }
    return playerPosition;
  }

  calculateOpponentPositions() {
    const gamingSpace = this.gamePlay.boardSize;
    const lastColumn = gamingSpace - 1;
    const opponentPosition = [];

    for (let row = 0; row < gamingSpace; row += 1) {
      opponentPosition.push(row * gamingSpace + lastColumn - 1, row * gamingSpace + lastColumn);
    }
    return opponentPosition;
  }

  getRandom(positions) {
    this.positions = positions;
    return this.positions[Math.floor(Math.random() * this.positions.length)];
  }

  teamsPosition(team, positions) {
    if (team.length > positions.length) {
      throw new Error('Not enough positions for the team members.');
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const item of team) {
      const randomIndex = Math.floor(Math.random() * positions.length);
      const randomPosition = positions.splice(randomIndex, 1)[0];
      this.gameState.allPositions.push(new PositionedCharacter(item, randomPosition));
    }
  }

  onNewGameClick() {
    this.playerTeam = new Team();
    this.opponentTeam = new Team();
    this.playerCharacters = [Bowman, Swordsman, Magician];
    this.opponentCharacters = [Vampire, Undead, Daemon];
    this.gameState.isUsersTurn = true;
    this.gameState.level = 0;
    this.gameState.allPositions = [];
    this.gameState.points = 0;
    this.gameState.selected = null;
    this.playerTeam.addAll(generateTeam(this.playerCharacters, 1, 2));
    this.opponentTeam.addAll(generateTeam(this.opponentCharacters, 1, 2));
    this.teamsPosition(this.playerTeam, this.calculatePlayerPositions());
    this.teamsPosition(this.opponentTeam, this.calculateOpponentPositions());
    this.gamePlay.redrawPositions(this.gameState.allPositions);

    GamePlay.showMessage(`Level ${this.gameState.level + 1}`);
  }

  onSaveGameClick() {
    this.stateService.save(GameState.from(this.gameState));
    GamePlay.showMessage('Saved');
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
