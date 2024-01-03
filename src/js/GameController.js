/* eslint-disable max-len */
import GamePlay from './GamePlay';
import GameState from './GameState';
import themes from './themes';
import cursors from './cursors';
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

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

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
    this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-yellow'));

    GamePlay.showMessage(`Level ${this.gameState.level + 1}`);
  }

  onSaveGameClick() {
    this.stateService.save(this.gameState);
    GamePlay.showMessage('Игра сохранилась!');
  }

  onLoadGameClick() {
    const state = this.stateService.load();
    if (state) {
      this.gameState = state;
      this.gamePlay.redrawPositions(this.gameState.allPositions);
      GamePlay.showMessage('Загрузка сохраненной игры!');
    } else {
      GamePlay.showError('Нет доступных сохранений');
    }
  }

  onCellEnter(index) {
    const hoveredCharacter = this.getCharacterInfo(index);
    const selectedCharacter = this.isPlayerCharacter(index);

    if (hoveredCharacter) {
      const char = hoveredCharacter.character;
      const message = `\u{1F396}${char.level} \u{2694}${char.attack} \u{1F6E1}${char.defence} \u{2764}${char.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }

    if (!hoveredCharacter || (hoveredCharacter && selectedCharacter && this.gameState.selected === null)) {
      this.gamePlay.setCursor(cursors.auto);
    }

    if (hoveredCharacter && selectedCharacter) {
      this.gamePlay.setCursor(cursors.pointer);
    }

    if (this.gameState.selected !== null && !hoveredCharacter && this.canMove(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
      return;
    }

    if (this.gameState.selected !== null && hoveredCharacter && !selectedCharacter && this.canAttack(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
      return;
    }

    if (this.gameState.selected !== null && !this.canMove(index) && !this.toAttack(index)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
  }

  onCellClick(index) {
    const hoveredCharacter = this.getCharacterInfo(index);
    const selectedCharacter = this.isPlayerCharacter(index);

    if (selectedCharacter) {
      this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-green', 'selected-yellow'));
      this.gamePlay.selectCell(index);
      this.gameState.selected = index;
      return;
    }

    if (this.gameState.selected !== null && this.gameState.isUsersTurn) {
      if (!hoveredCharacter && this.toMove(index)) {
        this.moveCharacter(index);
        console.log(`Trying to move to ${index}`);
        console.log(`Is move allowed: ${this.toMove(index)}`);
        console.log(`Is user's turn: ${this.gameState.isUsersTurn}`);
      } else if (hoveredCharacter && this.toAttack(index)) {
        this.attackCharacter(this.gameState.selected, index);
        this.gameState.isUsersTurn = false;
      } else {
        GamePlay.showError('Невозможный ход или клетка занята!');
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-red'));
    this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-green'));
  }

  getCharacterInfo(index) {
    return this.gameState.allPositions.find((char) => char.position === index);
  }

  isPlayerCharacter(index) {
    const characterInfo = this.getCharacterInfo(index);
    if (characterInfo) {
      const player = characterInfo.character;
      return this.playerCharacters.some((charClass) => player instanceof charClass);
    }
    return false;
  }

  getSelectedCharacter() {
    console.log('Current selected position:', this.gameState.selected);
    console.log('All positions:', this.gameState.allPositions);

    const char = this.gameState.allPositions.find((posChar) => {
      console.log('Checking character at position:', posChar.position);
      return posChar.position === this.gameState.selected;
    });

    if (!char) {
      console.log('Character not found for selected position:', this.gameState.selected);
      this.gameState.selected = null;
    } else {
      console.log('Character found:', char);
    }
    return char;
  }

  indexToRowCol(index) {
    const row = Math.floor(index / this.gamePlay.boardSize);
    const col = index % this.gamePlay.boardSize;
    return { row, col };
  }

  rowColToIndex(row, col) {
    return row * this.gamePlay.boardSize + col;
  }

  canMove(index) {
    const selectedPositionedCharacter = this.getSelectedCharacter();
    if (!selectedPositionedCharacter) {
      console.log('No selected character.');
      return false;
    }

    const selectedCharacter = selectedPositionedCharacter.character;
    const selectedPosition = this.indexToRowCol(selectedPositionedCharacter.position);
    const targetPositionRowCol = this.indexToRowCol(index);

    const rowDiff = Math.abs(targetPositionRowCol.row - selectedPosition.row);
    const colDiff = Math.abs(targetPositionRowCol.col - selectedPosition.col);

    let maxMoveDistance;
    switch (selectedCharacter.constructor) {
      case Swordsman:
      case Undead:
        maxMoveDistance = 4;
        break;
      case Bowman:
      case Vampire:
        maxMoveDistance = 2;
        break;
      case Magician:
      case Daemon:
        maxMoveDistance = 1;
        break;
      default:
        return false;
    }

    const isCellFree = !this.getCharacterInfo(index);
    const isRowMove = rowDiff <= maxMoveDistance && colDiff === 0;
    const isColMove = colDiff <= maxMoveDistance && rowDiff === 0;
    const isMoveStraight = isRowMove || isColMove;
    const isMoveDiagonal = rowDiff === colDiff && rowDiff <= maxMoveDistance;

    const canMoveResult = isCellFree && (isMoveStraight || isMoveDiagonal);
    console.log(`canMove called for index: ${index}`);
    console.log(`Can move result for index ${index}: ${canMoveResult}`);

    return canMoveResult;
  }

  toMove(index) {
    const selectedPositionedCharacter = this.getSelectedCharacter();
    if (!selectedPositionedCharacter) {
      console.log('No selected character.');
      return false;
    }

    const selectedCharacter = selectedPositionedCharacter.character;
    const selectedPosition = this.indexToRowCol(selectedPositionedCharacter.position);
    const targetPositionRowCol = this.indexToRowCol(index);

    const rowDiff = Math.abs(targetPositionRowCol.row - selectedPosition.row);
    const colDiff = Math.abs(targetPositionRowCol.col - selectedPosition.col);

    let maxMoveDistance;
    switch (selectedCharacter.constructor) {
      case Swordsman:
      case Undead:
        maxMoveDistance = 4;
        break;
      case Bowman:
      case Vampire:
        maxMoveDistance = 2;
        break;
      case Magician:
      case Daemon:
        maxMoveDistance = 1;
        break;
      default:
        console.error('Unknown character type:', selectedCharacter.constructor.name);
        return false;
    }

    const isCellFree = !this.getCharacterInfo(index);
    const isRowMove = rowDiff <= maxMoveDistance && colDiff === 0;
    const isColMove = colDiff <= maxMoveDistance && rowDiff === 0;
    const isMoveStraight = isRowMove || isColMove;
    const isMoveDiagonal = rowDiff === colDiff && rowDiff <= maxMoveDistance;

    const canMove = isCellFree && (isMoveStraight || isMoveDiagonal);
    console.log(`toMove called for index: ${index}`);
    console.log(`Can move result: ${canMove}`);

    if (canMove) {
      console.log(`Character can move from ${selectedPositionedCharacter.position} to ${index}`);
    } else {
      console.log(`Cannot move to ${index}. Move straight: ${isMoveStraight}, Move diagonal: ${isMoveDiagonal}, Cell free: ${isCellFree}`);
    }
    return canMove;
  }

  canAttack(index) {
    console.log('canAttack function called');
    const selectedPositionedCharacter = this.getSelectedCharacter();
    const targetPositionedCharacter = this.getCharacterInfo(index);

    if (!selectedPositionedCharacter || !targetPositionedCharacter) {
      console.log('No selected character or target character.');
      return false;
    }

    const selectedCharacter = selectedPositionedCharacter.character;
    const selectedPosition = this.indexToRowCol(selectedPositionedCharacter.position);
    const targetPositionRowCol = this.indexToRowCol(targetPositionedCharacter.position);

    const rowDiff = Math.abs(targetPositionRowCol.row - selectedPosition.row);
    const colDiff = Math.abs(targetPositionRowCol.col - selectedPosition.col);

    if (rowDiff === 0 && colDiff === 0) {
      console.log('Attack is not possible: target is on the same position');
      return false;
    }

    console.log(selectedPosition);
    console.log(targetPositionRowCol);
    console.log(`Row difference: ${rowDiff}`);
    console.log(`Column difference: ${colDiff}`);

    let maxAttackRadius;
    console.log(`Character type: ${selectedCharacter.constructor.name}`);

    switch (selectedCharacter.constructor) {
      case Swordsman:
      case Undead:
        maxAttackRadius = 1;
        break;
      case Bowman:
      case Vampire:
        maxAttackRadius = 2;
        break;
      case Magician:
      case Daemon:
        maxAttackRadius = 4;
        break;
      default:
        console.log('Unknown character type:', selectedCharacter.constructor.name);
        return false;
    }

    const canAttackResult = rowDiff <= maxAttackRadius && colDiff <= maxAttackRadius;
    console.log(`Can attack result for index ${index}: ${canAttackResult}`); // Результат возможности атаки

    return canAttackResult;
  }

  toAttack(index) {
    if (this.canAttack(index)) {
      console.log(`Attacked character at position ${index}`);
      return true;
    }
    console.log('Attack is not possible');
    return false;
  }

  moveCharacter(index) {
    const selectedChar = this.getSelectedCharacter();
    console.log(`Attempting to move character to index: ${index}`);

    if (!selectedChar) {
      console.log('No character is selected or character is lost.');
      return;
    }

    if (this.toMove(index)) {
      selectedChar.position = index;
      this.gamePlay.deselectCell(this.gameState.selected);
      this.gamePlay.redrawPositions(this.gameState.allPositions);
    }

    const opponentsInRange = this.gameState.allPositions.filter((posChar) => this.isPlayerCharacter(posChar.position) !== this.isPlayerCharacter(index) && this.canAttack(posChar.position));

    if (opponentsInRange.length > 0) {
      console.log('Available opponents for attack:', opponentsInRange);
    } else {
      console.log('No opponents in range. Ending turn.');
      this.gameState.isUsersTurn = false;
      this.opponentTurn();
    }

    console.log(`Character moved to ${index}`);
  }

  opponentTurn() {
    console.log('Opponent turn started. Current game state:', this.gameState);

    if (!this.gameState.isUsersTurn) {
      const opponentChars = this.gameState.allPositions.filter((posChar) => GameController.isCharacterOfTeam(posChar.character, this.opponentCharacters));
      const playerChars = this.gameState.allPositions.filter((posChar) => GameController.isCharacterOfTeam(posChar.character, this.playerCharacters));

      if (opponentChars.length === 0 || playerChars.length === 0) {
        console.log('No characters to make a move or game is over.');
        return;
      }

      const randomChar = opponentChars[Math.floor(Math.random() * opponentChars.length)];
      console.log('Random opponent character chosen:', randomChar);
      this.gameState.selected = randomChar.position;

      let actionTaken = false;

      const targetForAttack = playerChars.find((target) => this.canAttack(randomChar.position, target.position));

      if (targetForAttack) {
        this.attackCharacter(randomChar.position, targetForAttack.position);
        console.log(`Opponent character at position ${randomChar.position} attacked player character at position ${targetForAttack.position}`);
        actionTaken = true;
      } else {
        const moveTo = this.getRandomMove(randomChar.position);
        if (moveTo !== null) {
          this.moveOpponentCharacter(randomChar.position, moveTo);
          console.log(`Opponent character at position ${randomChar.position} moved to position ${moveTo}`);
          actionTaken = true;

          const newTargetForAttack = playerChars.find((target) => this.canAttack(moveTo, target.position));
          if (newTargetForAttack) {
            this.attackCharacter(moveTo, newTargetForAttack.position);
            console.log(`Opponent character at position ${moveTo} attacked player character at position ${newTargetForAttack.position}`);
          }
        }
      }

      if (actionTaken) {
        this.gamePlay.redrawPositions(this.gameState.allPositions);
      }

      this.gameState.isUsersTurn = true;
      console.log('Turn after change:', this.gameState.isUsersTurn);
    }
  }

  moveOpponentCharacter(fromIndex, toIndex) {
    const charIndex = this.gameState.allPositions.findIndex((char) => char.position === fromIndex);
    if (charIndex >= 0) {
      this.gameState.allPositions[charIndex].position = toIndex;
    }
    this.gamePlay.redrawPositions(this.gameState.allPositions);
  }

  static calculateDamage(attacker, target) {
    return Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
  }

  static isCharacterOfTeam(character, team) {
    return team.some((charClass) => character instanceof charClass);
  }

  static selectTargetForAttack(playerCharacters) {
    const sortedTargets = playerCharacters.sort((a, b) => a.character.health - b.character.health);
    return sortedTargets[0];
  }

  async attackCharacter(attackerIndex, targetIndex) {
    const attacker = this.getSelectedCharacter(attackerIndex);
    const target = this.getCharacterInfo(targetIndex);

    if (!attacker || !target) {
      console.log('Неверные индексы атакующего или цели');
      return;
    }

    const damage = Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1,
    );

    await this.gamePlay.showDamage(targetIndex, damage);

    const updatedHealth = target.character.health - damage;
    target.character.health = updatedHealth;

    if (updatedHealth <= 0) {
      this.removeCharacter(targetIndex);
    }

    this.gamePlay.redrawPositions(this.gameState.allPositions);

    this.checkForVictory();
  }

  removeCharacter(index) {
    const charIndex = this.gameState.allPositions.findIndex((posChar) => posChar.position === index);
    if (charIndex > -1) {
      this.gameState.allPositions.splice(charIndex, 1);
    }
  }

  checkForVictory() {
    const livingOpponents = this.gameState.allPositions.filter((posChar) => this.opponentCharacters.includes(posChar.character.constructor));
    if (livingOpponents.length === 0) {
      GamePlay.showMessage('Victory! All enemies have been defeated!');
      this.levelUpCharacters();
      this.startNewLevel();
    }
  }

  getRandomMove(position) {
    const characterInfo = this.getCharacterInfo(position);
    if (!characterInfo) return null;

    const { row: currentRow, col: currentCol } = this.indexToRowCol(position);
    const possibleMoves = [];

    for (let row = currentRow - 4; row <= currentRow + 4; row += 1) {
      for (let col = currentCol - 4; col <= currentCol + 4; col += 1) {
        if (row >= 0 && row < this.gamePlay.boardSize && col >= 0 && col < this.gamePlay.boardSize) {
          const index = this.rowColToIndex(row, col);
          if (this.canMove(index)) {
            possibleMoves.push(index);
          }
        }
      }
    }

    if (possibleMoves.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }
}
