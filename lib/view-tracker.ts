"use server"

import { incrementViewCount as dbIncrementViewCount, getViewCount as dbGetViewCount } from "./db"

export async function incrementViewCount(): Promise<number> {
  return await dbIncrementViewCount()
}

export async function getViewCount(): Promise<number> {
  return await dbGetViewCount()
}
