import { useEffect, useRef, useState } from 'react'

function useSessionStorage (key, defaultValue, { serialize = JSON.stringify, deserialize = JSON.parse } = {}) {
  const [state, setState] = useState(() => {
    const itemInStorage = window.sessionStorage.getItem(key)
    if (itemInStorage) {
      return deserialize(itemInStorage)
    }
    return typeof defaultValue === 'function' ? defaultValue() : (defaultValue || '')
  })

  const prevKeyRef = useRef(key)

  useEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey !== key) {
      window.sessionStorage.removeItem(prevKey)
    }
    prevKeyRef.current = key
    window.sessionStorage.setItem(key, serialize(state))
  }, [key, state, serialize])

  return [state, setState]
}

export { useSessionStorage }
