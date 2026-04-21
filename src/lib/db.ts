// MySQL connection helper with tagged-template compatibility.
import mysql from 'mysql2/promise'

type SqlValue = string | number | boolean | Date | Buffer | null | undefined | SqlFragment

type QueryResult = Array<Record<string, unknown>> | { insertId?: number; affectedRows?: number }

class SqlFragment {
  sql: string
  values: unknown[]

  constructor(sql: string, values: unknown[]) {
    this.sql = sql
    this.values = values
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return executeQuery(this.sql, this.values).then(onfulfilled, onrejected)
  }
}

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  waitForConnections: true,
  decimalNumbers: true,
})

function normalizeResult(rows: unknown, result: mysql.ResultSetHeader | mysql.RowDataPacket[] | mysql.RowDataPacket[][]) {
  if (Array.isArray(rows)) {
    return rows as Array<Record<string, unknown>>
  }

  const header = result as mysql.ResultSetHeader
  return [{ insertId: header.insertId, affectedRows: header.affectedRows }]
}

async function executeQuery(sqlText: string, values: unknown[]): Promise<QueryResult> {
  const [rows] = await pool.query(sqlText, values)
  return normalizeResult(rows, rows as never)
}

function buildFragment(strings: TemplateStringsArray, values: SqlValue[]) {
  let sqlText = ''
  const params: unknown[] = []

  for (let index = 0; index < strings.length; index++) {
    sqlText += strings[index]

    if (index >= values.length) {
      continue
    }

    const value = values[index]

    if (value instanceof SqlFragment) {
      sqlText += value.sql
      params.push(...value.values)
      continue
    }

    sqlText += '?'
    params.push(value)
  }

  return new SqlFragment(sqlText, params)
}

export const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: SqlValue[]) => buildFragment(strings, values),
  {
    query: async (query: string, values: unknown[] = []) => executeQuery(query, values),
    fragment: buildFragment,
    pool,
  }
)

export async function testConnection() {
  try {
    const rows = await sql`SELECT NOW() AS now, DATABASE() AS db`
    return rows
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}
