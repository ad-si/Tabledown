import assert from "node:assert/strict"
import { execSync } from "node:child_process"

const command =
  `echo '[{"name": "John", "age": 32}, {"name": "Anna", "age": 27}]' \\
    | cli/cli.js`

const expectedTable = `name | age
-----|----
John | 32
Anna | 27
`

const table = execSync(command).toString()

assert.equal(table, expectedTable, "CLI produces the expected table")

console.info("Command line interface test passed ✔")
