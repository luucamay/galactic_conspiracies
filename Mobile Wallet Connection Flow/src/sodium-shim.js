// Browser shim for sodium-universal used by WDK memory-safe signing key.
// In web environments we cannot guarantee native zeroization semantics.
export function sodium_memzero(buf) {
  if (!buf) return;

  if (buf instanceof Uint8Array) {
    buf.fill(0);
    return;
  }

  if (ArrayBuffer.isView(buf) && typeof buf.fill === 'function') {
    buf.fill(0);
    return;
  }

  if (buf instanceof ArrayBuffer) {
    new Uint8Array(buf).fill(0);
  }
}

export default {
  sodium_memzero,
};
