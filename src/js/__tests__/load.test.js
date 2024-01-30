import GameController from '../GameController';
import GameState from '../GameState';
import GamePlay from '../GamePlay';

jest.mock('../GamePlay');

describe('GameController', () => {
  let gameController;
  let mockGamePlay;
  let mockGameStateService;

  beforeEach(() => {
    mockGamePlay = new GamePlay();
    mockGameStateService = {
      load: jest.fn(),
    };
    gameController = new GameController(mockGamePlay, mockGameStateService);
  });

  test('load game successfully', () => {
    const savedState = {
      isUsersTurn: true, level: 1, allPositions: Array(3), points: 0, statistics: Array(0),
    };
    mockGameStateService.load.mockReturnValue(savedState);

    gameController.onLoadGameClick();

    expect(gameController.gameState).toEqual(GameState.from(savedState));
    // eslint-disable-next-line max-len
    expect(mockGamePlay.redrawPositions).toHaveBeenCalledWith(gameController.gameState.allPositions);
  });

  test('load game failure', () => {
    mockGameStateService.load.mockReturnValue(null);

    gameController.onLoadGameClick();

    expect(GamePlay.showError).toHaveBeenCalledWith('Нет доступных сохранений');
  });
});
