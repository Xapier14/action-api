import { Writable as _Writable } from "stream";
import { inherits } from "util";
// use Node.js Writable, otherwise load polyfill
var Writable = _Writable || require("readable-stream").Writable;

/* Writable memory stream */
export class WMStream extends Writable {
  constructor(key, options) {
    super(options);
    // // allow use without new operator
    // if (!(this instanceof WMStream)) {
    //   return new WMStream(key, options);
    // }
    this.key = key; // save key
    this.rawBuffer = Buffer.from([]);
    // memStore[key] = this.rawBuffer; // empty
  }
  _write(chunk, enc, cb) {
    // our memory store stores things in buffers
    var buffer = Buffer.isBuffer(chunk)
      ? chunk // already is Buffer use it
      : Buffer.from(chunk); // string, convert

    // concat to the buffer already there
    this.rawBuffer = Buffer.concat([this.rawBuffer, buffer]);
    cb();
  }
}
