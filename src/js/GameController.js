/* eslint-disable max-len */
import GamePlay from './GamePlay';
import GameState, { MAX_LEVEL } from './GameState';
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
    this.isGameBlocked = false;
  }

  init() {
    this.gameState = new GameState();
    this.gameState.level = 1;
    this.gameState.points = 0;
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
    this.switchTurn = this.switchTurn.bind(this);
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
      const pos1 = row * gamingSpace + lastColumn - 1;
      const pos2 = row * gamingSpace + lastColumn;

      if (!this.gameState.allPositions.some((posChar) => posChar.position === pos1)) {
        opponentPosition.push(pos1);
      }

      if (!this.gameState.allPositions.some((posChar) => posChar.position === pos2)) {
        opponentPosition.push(pos2);
      }
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

  switchTurn() {
    if (this.gameState.isUsersTurn) {
      this.gameState.isUsersTurn = false;
      this.opponentTurn();
    } else {
      this.gameState.isUsersTurn = true;
    }
  }

  onNewGameClick() {
    const themeName = themes.find((theme) => theme.level === 1).name;
    this.gamePlay.drawUi(themeName);
    this.playerTeam = new Team();
    this.opponentTeam = new Team();
    this.playerCharacters = [Bowman, Swordsman, Magician];
    this.opponentCharacters = [Vampire, Undead, Daemon];
    this.gameState.isUsersTurn = true;
    this.gameState.level = 1;
    this.gameState.allPositions = [];
    this.gameState.points = 0;
    this.gameState.setSelectedIndex(null);
    this.playerTeam.addAll(generateTeam(this.playerCharacters, 1, 2));
    this.opponentTeam.addAll(generateTeam(this.opponentCharacters, 1, 2));
    this.teamsPosition(this.playerTeam, this.calculatePlayerPositions());
    this.teamsPosition(this.opponentTeam, this.calculateOpponentPositions());
    this.gamePlay.redrawPositions(this.gameState.allPositions);
    this.gamePlay.deselectCellsByColor(['selected-yellow']);

    GamePlay.showMessage(`Уровень ${this.gameState.level}`);
  }

  onSaveGameClick() {
    this.stateService.save(GameState.from(this.gameState));
    GamePlay.showMessage('Игра сохранилась!');
  }

  onLoadGameClick() {
    const state = this.stateService.load();
    if (state && state.allPositions) {
      this.gameState = GameState.from(state);
      this.gamePlay.redrawPositions(this.gameState.allPositions);
      GamePlay.showMessage('Загрузка сохраненной игры!');

      this.playerTeam = new Team();
      this.opponentTeam = new Team();

      this.gameState.allPositions = state.allPositions.map((elem) => {
        let char;
        switch (elem.character.type) {
          case 'bowman':
            char = new Bowman(elem.character.level);
            break;
          case 'daemon':
            char = new Daemon(elem.character.level);
            break;
          case 'magician':
            char = new Magician(elem.character.level);
            break;
          case 'swordsman':
            char = new Swordsman(elem.character.level);
            break;
          case 'undead':
            char = new Undead(elem.character.level);
            break;
          case 'vampire':
            char = new Vampire(elem.character.level);
            break;
          default:
            GamePlay.showError('Неизвестный тип персонажа');
        }
        char.health = elem.character.health;
        const positionedChar = new PositionedCharacter(char, elem.position);

        if (this.playerCharacters.includes(char.constructor)) {
          this.playerTeam.add(char);
        } else {
          this.opponentTeam.add(char);
        }
        return positionedChar;
      });

      const theme = themes.find((t) => t.level === this.gameState.level);
      this.gamePlay.drawUi(theme.name);
      this.gamePlay.redrawPositions(this.gameState.allPositions);
    } else {
      GamePlay.showError('Нет доступных сохранений');
    }
  }

  onCellEnter(index) {
    if (this.isGameBlocked) return;

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

    if (this.gameState.selected !== null && hoveredCharacter && !selectedCharacter && this.canAttack(this.gameState.selected, index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
      return;
    }

    if (this.gameState.selected !== null && !this.canMove(index) && !this.toAttack(index)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }

    if (this.gameState.selected !== null && selectedCharacter && this.gameState.selected !== index) {
      this.gamePlay.setCursor(cursors.pointer);
    }
  }

  onCellClick(index) {
    if (this.isGameBlocked) return;

    const hoveredCharacter = this.getCharacterInfo(index);
    const selectedCharacter = this.isPlayerCharacter(index);

    if (selectedCharacter) {
      this.gamePlay.deselectCellsByColor(['selected-yellow', 'selected-green']);
      this.gamePlay.selectCell(index);
      this.gameState.setSelectedIndex(index);
      return;
    }

    if (this.gameState.selected !== null && this.gameState.isUsersTurn) {
      if (hoveredCharacter && !selectedCharacter && this.canAttack(this.gameState.selected, index)) {
        this.attackCharacter(this.gameState.selected, index)
          .then(() => this.switchTurn());
      } else if (!hoveredCharacter && this.toMove(index)) {
        this.characterTurn(index);
        this.switchTurn();
      } else {
        GamePlay.showError('Невозможный ход или клетка занята!');
      }
    }
  }

  onCellLeave(index) {
    if (this.isGameBlocked) return;

    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.deselectCellsByColor(['selected-red']);
    this.gamePlay.deselectCellsByColor(['selected-green']);
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

  getSelectedCharacter(index = this.gameState.selected) {
    const char = this.getCharacterInfo(index);

    if (char) {
      this.gameState.setSelectedIndex(index);
    } else {
      this.gameState.setSelectedIndex(null);
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
      return false;
    }

    const selectedPosition = this.indexToRowCol(selectedPositionedCharacter.position);
    const targetPositionRowCol = this.indexToRowCol(index);

    const rowDiff = Math.abs(targetPositionRowCol.row - selectedPosition.row);
    const colDiff = Math.abs(targetPositionRowCol.col - selectedPosition.col);

    const maxMoveDistance = selectedPositionedCharacter.character.moveDistance;

    const isCellFree = !this.getCharacterInfo(index);
    const isRowMove = rowDiff <= maxMoveDistance && colDiff === 0;
    const isColMove = colDiff <= maxMoveDistance && rowDiff === 0;
    const isMoveStraight = isRowMove || isColMove;
    const isMoveDiagonal = rowDiff === colDiff && rowDiff <= maxMoveDistance;
    const canMoveResult = isCellFree && (isMoveStraight || isMoveDiagonal);

    return canMoveResult;
  }

  toMove(index) {
    const selectedPositionedCharacter = this.getSelectedCharacter();
    if (!selectedPositionedCharacter) {
      return false;
    }

    const selectedPosition = this.indexToRowCol(selectedPositionedCharacter.position);
    const targetPositionRowCol = this.indexToRowCol(index);

    const rowDiff = Math.abs(targetPositionRowCol.row - selectedPosition.row);
    const colDiff = Math.abs(targetPositionRowCol.col - selectedPosition.col);

    const maxMoveDistance = selectedPositionedCharacter.character.moveDistance;

    const isCellFree = !this.getCharacterInfo(index);
    const isRowMove = rowDiff <= maxMoveDistance && colDiff === 0;
    const isColMove = colDiff <= maxMoveDistance && rowDiff === 0;
    const isMoveStraight = isRowMove || isColMove;
    const isMoveDiagonal = rowDiff === colDiff && rowDiff <= maxMoveDistance;

    const canMove = isCellFree && (isMoveStraight || isMoveDiagonal);

    return canMove;
  }

  canAttack(attackerIndex, targetIndex) {
    const attackerPositionedCharacter = this.getCharacterInfo(attackerIndex);
    const targetPositionedCharacter = this.getCharacterInfo(targetIndex);

    if (!attackerPositionedCharacter || !targetPositionedCharacter || this.isPlayerCharacter(targetIndex) === this.isPlayerCharacter(attackerIndex)) {
      return false;
    }

    const attackerCharacter = attackerPositionedCharacter.character;
    const attackerPosition = this.indexToRowCol(attackerPositionedCharacter.position);
    const targetPositionRowCol = this.indexToRowCol(targetPositionedCharacter.position);

    const rowDiff = Math.abs(targetPositionRowCol.row - attackerPosition.row);
    const colDiff = Math.abs(targetPositionRowCol.col - attackerPosition.col);

    if (rowDiff === 0 && colDiff === 0) {
      return false;
    }

    const maxAttackRadius = attackerCharacter.attackRadius;

    const canAttackResult = rowDiff <= maxAttackRadius && colDiff <= maxAttackRadius;

    return canAttackResult;
  }

  toAttack(targetIndex) {
    const attackerIndex = this.gameState.selected;
    if (this.canAttack(attackerIndex, targetIndex)) {
      this.attackCharacter(attackerIndex, targetIndex);
      return true;
    }
    return false;
  }

  characterTurn(index) {
    const selectedChar = this.getSelectedCharacter();

    if (!selectedChar) {
      return;
    }

    let actionTaken = false;

    if (this.toMove(index)) {
      selectedChar.position = index;
      this.gamePlay.deselectCell(this.gameState.selected);
      this.gamePlay.redrawPositions(this.gameState.allPositions);
      actionTaken = true;
    }

    if (!actionTaken && this.canAttack(this.gameState.selected, index)) {
      this.attackCharacter(this.gameState.selected, index);
      actionTaken = true;
    }
  }

  async opponentTurn() {
    if (!this.gameState.isUsersTurn) {
      const opponentChars = this.gameState.allPositions.filter((posChar) => this.opponentTeam.has(posChar.character));
      const playerChars = this.gameState.allPositions.filter((posChar) => this.playerTeam.has(posChar.character));

      if (opponentChars.length === 0 || playerChars.length === 0) {
        return;
      }

      let chosenTarget;
      let chosenAttacker;

      // eslint-disable-next-line no-restricted-syntax
      for (const oppоnent of opponentChars) {
        const attackableTargets = playerChars.filter((target) => this.canAttack(oppоnent.position, target.position));

        if (attackableTargets.length > 0) {
          const targetWithLeastHealth = attackableTargets.reduce((prev, current) => ((prev.character.health < current.character.health) ? prev : current));

          if (!chosenTarget || targetWithLeastHealth.character.health < chosenTarget.character.health) {
            chosenTarget = targetWithLeastHealth;
            chosenAttacker = oppоnent;
          }
        }
      }

      let actionTaken = false;

      if (chosenAttacker && chosenTarget) {
        await this.attackCharacter(chosenAttacker.position, chosenTarget.position);
        actionTaken = true;
      } else {
        const randomMoverIndex = Math.floor(Math.random() * opponentChars.length);
        const mover = opponentChars[randomMoverIndex];
        this.gameState.setSelectedIndex(mover.position);
        const moveTo = this.getRandomMove(mover.position);
        if (moveTo !== null) {
          this.moveOpponentCharacter(mover.position, moveTo);
          actionTaken = true;
        }
      }

      this.gamePlay.redrawPositions(this.gameState.allPositions);
      if (actionTaken) {
        this.switchTurn();
      }
    }
  }

  moveOpponentCharacter(fromIndex, toIndex) {
    const charIndex = this.gameState.allPositions.findIndex((char) => char.position === fromIndex);
    if (charIndex >= 0) {
      this.gameState.allPositions[charIndex].position = toIndex;
    }
    this.gamePlay.redrawPositions(this.gameState.allPositions);
  }

  async attackCharacter(attackerIndex, targetIndex) {
    const attacker = this.getCharacterInfo(attackerIndex);
    const target = this.getCharacterInfo(targetIndex);

    if (!attacker || !target) {
      return;
    }

    const damage = Math.round(Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1,
    ));

    await this.gamePlay.showDamage(targetIndex, damage);

    const updatedHealth = Math.round(target.character.health - damage);

    target.character.health = updatedHealth;

    if (updatedHealth <= 0) {
      this.removeCharacter(targetIndex);
      this.removeCharacterFromTeam(target.character);
      if (targetIndex === this.gameState.selected) {
        this.gamePlay.deselectCell(targetIndex);
        this.gameState.setSelectedIndex(null);
      }
    }

    this.gamePlay.redrawPositions(this.gameState.allPositions);
    this.checkForVictory();
  }

  static calculateDamage(attacker, target) {
    return Math.round(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
  }

  static selectTargetForAttack(playerCharacters) {
    const sortedTargets = playerCharacters.sort((a, b) => a.character.health - b.character.health);
    return sortedTargets[0];
  }

  removeCharacter(index) {
    const charIndex = this.gameState.allPositions.findIndex((posChar) => posChar.position === index);
    if (charIndex > -1) {
      this.gameState.allPositions.splice(charIndex, 1);
    }
  }

  removeCharacterFromTeam(character) {
    if (this.playerCharacters.some((charClass) => character instanceof charClass)) {
      this.playerTeam.delete(character);
    } else if (this.opponentCharacters.some((charClass) => character instanceof charClass)) {
      this.opponentTeam.delete(character);
    }
  }

  checkForVictory() {
    const livingOpponents = this.gameState.allPositions.filter((posChar) => this.opponentCharacters.includes(posChar.character.constructor));
    const livingPlayerCharacters = this.gameState.allPositions.filter((posChar) => this.playerCharacters.includes(posChar.character.constructor));

    if (livingOpponents.length === 0) {
      if (this.gameState.level === MAX_LEVEL) {
        GamePlay.showMessage('Поздравляем! Вы победитель!');
        this.gamePlay.deselectCellsByColor(['selected-red', 'selected-green', 'selected-yellow']);
        this.isGameBlocked = true;
      } else {
        GamePlay.showMessage('Вы перешли на следующий уровень!');
        this.gameState.level += 1;
        this.startNewLevel();
      }
    } else if (livingPlayerCharacters.length === 0) {
      GamePlay.showMessage('Вы проиграли. Попробуйте снова!');
      this.init();
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
          if (this.canMove(index) && !this.getCharacterInfo(index)) {
            possibleMoves.push(index);
          }
        }
      }
    }

    if (possibleMoves.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }

  startNewLevel() {
    const newTheme = themes.find((theme) => theme.level === this.gameState.level).name;
    this.gamePlay.drawUi(newTheme);

    this.gameState.allPositions.forEach((posChar) => {
      if (this.isPlayerCharacter(posChar.position)) {
        posChar.character.levelUp();
      }
    });

    this.gameState.allPositions = this.gameState.allPositions.filter((posChar) => !this.isPlayerCharacter(posChar.position));

    const existingCharacters = Array.from(this.playerTeam.characters);
    this.playerTeam = new Team();
    existingCharacters.forEach((char) => this.playerTeam.add(char));

    const currentPlayersCount = this.playerTeam.characters.size;
    const requiredPlayersCount = this.gameState.level + 1;
    const newPlayersToAdd = requiredPlayersCount - currentPlayersCount;

    if (newPlayersToAdd > 0) {
      const newCharacters = generateTeam(this.playerCharacters, this.gameState.level, newPlayersToAdd);
      newCharacters.forEach((char) => {
        this.playerTeam.add(char);
      });
    }

    this.opponentTeam = new Team();
    this.opponentTeam.addAll(generateTeam(this.opponentCharacters, this.gameState.level, requiredPlayersCount));

    this.teamsPosition(this.playerTeam.characters, this.calculatePlayerPositions());
    this.teamsPosition(this.opponentTeam.characters, this.calculateOpponentPositions());

    this.gamePlay.redrawPositions(this.gameState.allPositions);
    this.gameState.isUsersTurn = true;
    GamePlay.showMessage(`Level ${this.gameState.level}`);
  }
}
