import { extractProxy } from '../index'

test('extractProxy', async () => {
  expect(
    (
      await extractProxy({
        count: 1
      })
    ).length
  ).toBe(1)
})
