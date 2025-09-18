export class Ok {
  #value;
  constructor(value) { this.#value = value; }
  static of(value) { return new Ok(value); }
  isOk() { return true; }
  isErr() { return false; }
  getValue() { return this.#value; }
  getError() { throw new Error('Cannot get error from Ok result'); }
}

export class Err {
  #error;
  constructor(error) { this.#error = error; }
  static of(error) { return new Err(error); }
  isOk() { return false; }
  isErr() { return true; }
  getValue() { throw new Error('Cannot get value from Err result'); }
  getError() { return this.#error; }
}
