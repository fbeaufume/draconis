// Asynchronous processing order tests, it prints the letters in order (A, then B, etc)

print('A');

setTimeout(() => print('E'), 100);

setTimeout(() => print('D'), 0);

Promise.resolve('C').then(s => print(s));

print('B');

function print(message) {
  const date = new Date();
  console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} - ${message}`);
}
