import Magician from '../characters/Magician';

test('check information about character', () => {
  const magician = new Magician(1);
  const message = `\u{1F396}${magician.level} \u{2694}${magician.attack} \u{1F6E1}${magician.defence}  \u{2764}${magician.health}`;
  expect(message).toBe(`\u{1F396}${1} \u{2694}${10} \u{1F6E1}${40}  \u{2764}${100}`);
});
