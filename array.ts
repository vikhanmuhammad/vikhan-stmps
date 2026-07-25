function sieve(n: number): boolean[] {
  const isPrime = new Array<boolean>(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }

  return isPrime;
}

function buildReport(n: number): string {
  const isPrime = sieve(n);
  const tokens: string[] = [];

  for (let i = n; i >= 1; i--) {
    if (isPrime[i]) continue;

    const div3 = i % 3 === 0;
    const div5 = i % 5 === 0;

    let token: string;
    if (div3 && div5) token = "FooBar";
    else if (div3) token = "Foo";
    else if (div5) token = "Bar";
    else token = String(i);

    tokens.push(token);
  }

  return tokens.join(", ");
}

function main(): void {
  console.log(buildReport(100));
}

main();
