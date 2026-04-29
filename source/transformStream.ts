import { Transform, type Readable, type Writable } from "node:stream"
import Tabledown, { type DataInput } from "./index.js"

export default function transformStream(
  inputStream: Readable,
  outputStream: Writable,
): void {
  let buffer = ""

  inputStream
    .pipe(
      new Transform({
        writableObjectMode: false,
        readableObjectMode: false,
        transform(chunk: Buffer | string, _encoding, done) {
          buffer += chunk.toString()
          done()
        },
        flush(done) {
          try {
            const data = JSON.parse(buffer) as DataInput
            this.push(new Tabledown({ data }).toString())
            done()
          } catch (error) {
            done(error as Error)
          }
        },
      }),
    )
    .pipe(outputStream)
}
