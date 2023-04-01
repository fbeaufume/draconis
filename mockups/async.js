// This small program shows that setTimeout and promise processing are both executed asynchronously,
// but promise processing has a higher priority (they use microtasks) than setTimeout (that use macrotasks a.k.a. tasks).
// This program prints the numbers in order, i.e. 1, then 2, then 3, etc.

print(1);

setTimeout(() => print(8), 100);

setTimeout(() => print(7), 0);

Promise.resolve().then(() => print(3)).then(() => print(5));

Promise.resolve().then(() => print(4)).then(() => print(6));

print(2);

function print(message) {
  const date = new Date();
  console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} - ${message}`);
}
