// pdfjs-dist v6+ requires Map.prototype.getOrInsertComputed and
// Uint8Array.prototype.toHex, which are not available in all runtimes.

if (!("getOrInsertComputed" in Map.prototype)) {
  Object.defineProperty(Map.prototype, "getOrInsertComputed", {
    value(
      this: Map<unknown, unknown>,
      key: unknown,
      callbackFn: (key: unknown) => unknown,
    ): unknown {
      if (this.has(key)) {
        return this.get(key);
      }

      const value = callbackFn(key);
      this.set(key, value);
      return value;
    },
    writable: true,
    configurable: true,
  });
}

if (!("toHex" in Uint8Array.prototype)) {
  Object.defineProperty(Uint8Array.prototype, "toHex", {
    value(this: Uint8Array): string {
      let hex = "";
      for (let index = 0; index < this.length; index += 1) {
        hex += this[index].toString(16).padStart(2, "0");
      }
      return hex;
    },
    writable: true,
    configurable: true,
  });
}

export {};
