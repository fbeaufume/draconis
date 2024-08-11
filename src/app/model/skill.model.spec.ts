import { formatDescription } from './skill.model';

describe('transformString', () => {
  const testCases = [
    ['', ''],
    ['_', ''],
    ['__', ''],
    ['___', ''],
    ['foo bar' ,'foo bar'],
    ['_foo' ,'<b>foo</b>'],
    [' _foo ' ,' <b>foo</b> '],
    ['_foo bar' ,'<b>foo</b> bar'],
    ['foo _bar' ,'foo <b>bar</b>'],
    ['_12' ,'<b>12</b>'],
    ['_12%' ,'<b>12%</b>'],
    ['_12!' ,'<b>12!</b>'],
    ['foo_' ,'foo'],
    ['_foo_' ,'<b>foo</b>'],
    ['_one, _two.', '<b>one</b>, <b>two</b>.'],
    ['some_test', 'some<b>test</b>'],
    ['_hello# _world!', '<b>hello#</b> <b>world!</b>'],
  ];

  testCases.forEach((testCase) => {
    const input = testCase[0];
    const expected = testCase[1];
    it(`transform '${input}' to '${expected}'`, () => {
      const result = formatDescription(input);
      // expect(result).toBe(expected, `Actual result is '${result}'`);
      expect(result)/*.withContext(`Actual result is '${result}'`)*/.toBe(expected);
    })
  })
});
