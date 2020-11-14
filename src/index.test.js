import { MsalProvider, useSession } from '.'

describe('MsalProvider loads correctly', () => {
  it('is truthy', () => {
    expect(MsalProvider).toBeTruthy()
  })
})

describe('useSession loads correctly', () => {
  it('is truthy', () => {
    expect(useSession).toBeTruthy()
  })
})
