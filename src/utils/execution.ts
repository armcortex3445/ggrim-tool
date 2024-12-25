export function wait(ms: number) {
  let start: number = Date.now();
  let now: number = start;
  while (now - start < ms) {
    now = Date.now();
  }
}

export function sleep(second: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
} // 함수정의
