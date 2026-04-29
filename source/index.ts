export type Alignment = "left" | "right" | "center"
export type Style = "pipe"

interface StyleConfig {
  columnSeparator: string
}

const styles: Record<Style, StyleConfig> = {
  pipe: {
    columnSeparator: "|",
  },
}

export type DataRow = Record<string, unknown>
export type DataInput = DataRow[] | unknown[][]

export interface TabledownOptions {
  caption?: string | null
  data: DataInput
  style?: Style
  alignments?: Record<string, Alignment | undefined>
  capitalizeHeaders?: boolean
  headerTexts?: Record<string, string>
}

function stringify(value: unknown): string {
  return value instanceof Object ? JSON.stringify(value) : String(value)
}

function createHeaderFields(data: DataRow[]): string[] {
  const seen = new Set<string>()
  for (const row of data) {
    for (const key of Object.keys(row)) {
      seen.add(key)
    }
  }
  return [...seen]
}

function padString(
  value: unknown,
  length: number,
  alignment?: Alignment,
  capitalize?: boolean,
): string {
  let string = stringify(value)

  if (capitalize) {
    string = string.slice(0, 1).toUpperCase() + string.slice(1)
  }

  const padding = " ".repeat(Math.max(0, length - string.length))

  if (alignment === "right") {
    return padding + string
  }
  if (alignment === "center") {
    const paddingStart = " ".repeat(Math.floor(padding.length / 2))
    const paddingEnd = " ".repeat(padding.length - paddingStart.length)
    return paddingStart + string + paddingEnd
  }

  // Default and "left" alignment
  return string + padding
}

function getMaximumKeyLength(
  rows: DataRow[],
  initialValue: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = { ...initialValue }
  for (const row of rows) {
    for (const key of Object.keys(initialValue)) {
      if (!Object.hasOwn(row, key)) continue
      const length = stringify(row[key]).length
      if ((result[key] ?? 0) < length) {
        result[key] = length
      }
    }
  }
  return result
}

export default class Tabledown {
  caption?: string | null

  private readonly headerFields: string[]
  private readonly customHeaderFields: string[]
  private readonly maxFieldLengths: Record<string, number>
  private readonly data: DataRow[]
  private readonly style: Style
  private readonly alignments: Record<string, Alignment | undefined>
  private readonly capitalizeHeaders: boolean

  constructor(options: TabledownOptions) {
    const {
      caption,
      data,
      style = "pipe",
      alignments = {},
      capitalizeHeaders = false,
      headerTexts,
    } = options

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Data must be a non-empty array, got ${String(data)}`)
    }

    const first = data[0]
    let rows: DataRow[]
    let headerFields: string[]

    if (Array.isArray(first)) {
      const arrayData = data as unknown[][]
      headerFields = arrayData[0]!.map(String)
      rows = arrayData.slice(1).map((row) => {
        const returnObject: DataRow = {}
        headerFields.forEach((field, fieldIndex) => {
          returnObject[field] = row[fieldIndex]
        })
        return returnObject
      })
    } else if (typeof first === "object" && first !== null) {
      rows = data as DataRow[]
      headerFields = createHeaderFields(rows)
    } else {
      throw new Error(
        "Data must be an array of objects or an array of arrays",
      )
    }

    const customHeaderFields = headerTexts
      ? headerFields.map((field) => headerTexts[field] ?? field)
      : headerFields

    const initialFieldLengths: Record<string, number> = {}
    headerFields.forEach((field, index) => {
      initialFieldLengths[field] = String(customHeaderFields[index]).length
    })

    this.headerFields = headerFields
    this.customHeaderFields = customHeaderFields
    this.maxFieldLengths = getMaximumKeyLength(rows, initialFieldLengths)
    this.data = rows
    this.style = style
    this.alignments = alignments
    this.capitalizeHeaders = capitalizeHeaders
    this.caption = caption
  }

  get string(): string {
    const separator = styles[this.style].columnSeparator
    const cellSeparator = ` ${separator} `

    const paddedHeaderFields = this.customHeaderFields.map((field, index) =>
      padString(
        field,
        this.maxFieldLengths[this.headerFields[index]!]!,
        this.alignments[this.headerFields[index]!],
        this.capitalizeHeaders,
      ),
    )

    const headerLine = paddedHeaderFields
      .join(cellSeparator)
      .replace(/\s+$/, "")

    const separatorLine = paddedHeaderFields
      .map((paddedField, index) => {
        const field = this.headerFields[index]!
        const alignment = this.alignments[field]
        let numberOfHyphens = paddedField.length + 2

        if (index === 0 || index === paddedHeaderFields.length - 1) {
          numberOfHyphens--
        }

        let verticalSeparator = "-".repeat(numberOfHyphens)

        if (alignment === "left" || alignment === "center") {
          verticalSeparator = verticalSeparator.replace("-", ":")
        }
        if (alignment === "right" || alignment === "center") {
          verticalSeparator = verticalSeparator.replace(/-$/, ":")
        }
        return verticalSeparator
      })
      .join(separator)

    const bodyLines = this.data.map((entry) =>
      this.headerFields
        .map((field) =>
          Object.hasOwn(entry, field)
            ? padString(
                entry[field],
                this.maxFieldLengths[field]!,
                this.alignments[field],
              )
            : padString("", this.maxFieldLengths[field]!),
        )
        .join(cellSeparator)
        .replace(/\s+$/, ""),
    )

    const caption = this.caption ? `Table: ${this.caption}\n\n` : ""
    return `${caption}${headerLine}\n${separatorLine}\n${bodyLines.join("\n")}\n`
  }

  toString(): string {
    return this.string
  }

  toJSON(): string {
    return this.string
  }
}
