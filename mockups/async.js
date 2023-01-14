// This small program shows that setTimeout and promise processing are both executed asynchronously,
// but promise processing has a higher priority (they use microtasks) than setTimeout (that use macrotasks a.k.a. tasks).
// This program prints the letters in order, i.e. A, then B, then C, etc.

print('A');

setTimeout(() => print('F'), 100);

setTimeout(() => print('E'), 0);

Promise.resolve('C').then(s => print(s));

Promise.resolve('D').then(s => print(s));

print('B');

function print(message) {
  const date = new Date();
  console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} - ${message}`);
}
