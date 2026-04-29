import assert from "node:assert/strict"
import Tabledown, { type TabledownOptions } from "../source/index.js"

const baseConfig: Omit<TabledownOptions, "data"> = {
  caption: "Food",
  alignments: {
    name: "left",
    color: "right",
    quantity: "center",
  },
  style: "pipe",
}

const foodObjects = [
  { name: "banana", color: "yellow", price: 3.23, quantity: 2 },
  { name: "tomato", color: "red", price: 2.5, quantity: 6 },
  { name: "cucumber", color: "green", price: 5.82, quantity: 4 },
  { name: "carrot", color: "orange", price: 12, quantity: 9 },
]

const foodArrays = [
  ["name", "color", "price", "quantity"],
  ["banana", "yellow", 3.23, 2],
  ["tomato", "red", 2.5, 6],
  ["cucumber", "green", 5.82, 4],
  ["carrot", "orange", 12, 9],
]

const expectedTable = `Table: Food

name     |  color | price | quantity
:--------|-------:|-------|:-------:
banana   | yellow | 3.23  |    2
tomato   |    red | 2.5   |    6
cucumber |  green | 5.82  |    4
carrot   | orange | 12    |    9
`

const tableWithCustomHeaders = `The Fruit | The Color | The Price in Euro | The Quantity
:---------|----------:|-------------------|:-----------:
banana    |    yellow | 3.23              |      2
tomato    |       red | 2.5               |      6
cucumber  |     green | 5.82              |      4
carrot    |    orange | 12                |      9
`

{
  const result = new Tabledown({ ...baseConfig, data: foodObjects }).toString()
  assert.equal(result, expectedTable, "Creates a table from an array of objects")
}

{
  const result = new Tabledown({ ...baseConfig, data: foodArrays }).toString()
  assert.equal(result, expectedTable, "Creates a table from an array of arrays")
}

{
  const result = new Tabledown({
    ...baseConfig,
    data: foodObjects,
    capitalizeHeaders: true,
  }).toString()
  const capitalizedTable = expectedTable.replace(
    "name     |  color | price | quantity",
    "Name     |  Color | Price | Quantity",
  )
  assert.equal(result, capitalizedTable, "Capitalizes the table headers")
}

{
  const result = new Tabledown({
    ...baseConfig,
    data: foodObjects,
    caption: null,
    headerTexts: {
      name: "The Fruit",
      color: "The Color",
      price: "The Price in Euro",
      quantity: "The Quantity",
    },
  }).toString()
  assert.equal(result, tableWithCustomHeaders, "Renames the table headers")
}

console.info("Core tests passed ✔")
