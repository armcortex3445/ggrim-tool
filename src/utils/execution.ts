export function wait(second: number) {
  let start: number = Date.now();
  let now: number = start;
  const SECOND = 1000;
  while (now - start < second * SECOND) {
    now = Date.now();
  }
}

export function sleep(second: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
} // 함수정의
