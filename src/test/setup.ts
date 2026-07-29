import {
  afterEach,
} from "vitest";

import {
  cleanup,
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

class MemoryStorage
  implements Storage {
  private values =
    new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(
    key: string,
  ) {
    return (
      this.values.get(key) ??
      null
    );
  }

  key(
    index: number,
  ) {
    return (
      Array.from(
        this.values.keys(),
      )[index] ??
      null
    );
  }

  removeItem(
    key: string,
  ) {
    this.values.delete(key);
  }

  setItem(
    key: string,
    value: string,
  ) {
    this.values.set(
      key,
      String(value),
    );
  }
}

Object.defineProperty(
  window,
  "localStorage",
  {
    configurable: true,
    value:
      new MemoryStorage(),
  },
);

Object.defineProperty(
  window,
  "sessionStorage",
  {
    configurable: true,
    value:
      new MemoryStorage(),
  },
);

afterEach(() => {
  cleanup();

  window.localStorage.clear();
  window.sessionStorage.clear();
});
