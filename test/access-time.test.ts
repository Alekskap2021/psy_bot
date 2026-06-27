import { describe, expect, it } from 'vitest'

import { addDays, addMinutes } from '../src/utils/time'

describe('access time helpers', () => {
  it('calculates the paid access end date', () => {
    expect(addDays(new Date('2026-06-27T10:00:00.000Z'), 30)).toEqual(
      new Date('2026-07-27T10:00:00.000Z'),
    )
  })

  it('calculates the temporary invite link expiration date', () => {
    expect(addMinutes(new Date('2026-06-27T10:00:00.000Z'), 30)).toEqual(
      new Date('2026-06-27T10:30:00.000Z'),
    )
  })
})
