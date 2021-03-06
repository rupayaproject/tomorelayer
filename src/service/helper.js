/*
 * Basic function helpers
 */
export const isFunction = t => Boolean(t) && typeof t === 'function'

export const isString = str => Boolean(str) && typeof str === 'string'

// Compose from left-most to right-most
export const compose = (...functions) => (lastArg) =>
  functions.filter(isFunction).reduce((returned, currentFunc) => currentFunc(returned), lastArg)

export const isEmpty = (something) => {
  if (!something) {
    return true
  }
  if (something === '') {
    return true
  }
  if (typeof something === 'object' && something.length === 0) {
    return true
  }
  if (typeof something === 'object' && Object.keys(something).length === 0) {
    return true
  }
  return false
}

export const isTruthy = (something) => Boolean(something)

export const last = list => {
  if (list.length) {
    return list[list.length - 1]
  }
  return list[0] || list
  // NOTE: might handle strinng or object as well
}

export const round = (value, precision = 0) => {
  const multiplier = 10 ** precision
  const result = (Math.round(value * multiplier) / multiplier).toFixed(precision)
  return precision === 0 ? parseInt(result, 10) : parseFloat(result)
}

export const bilformat = (value, prefix = '') => {
  /*
   * format very big value to Billion/Million/Thousand as B/M/K
   */
  const unit = {
    1000000000: 'B',
    1000000: 'M',
    1000: 'K',
  }

  const unitFound = Object.keys(unit).reverse().find(k => value >= parseInt(k, 10))
  if (!unitFound) {
    return `${prefix} ${value}`
  } else {
    const rounded = round(value / parseInt(unitFound, 10), 2)
    return `${prefix} ${rounded}${unit[unitFound]}`
  }
}

export const strEqual = (...args) => {
  if (args.length >= 2) {
    const stringA = args[0]
    const stringB = args[1]

    if (!isString(stringA) || !isString(stringB)) {
      return false
    }

    return stringA.toLowerCase() === stringB.toLowerCase()
  }

  if (args.length === 1) {
    const stringA = args[0]

    if (!isString(stringA)) {
      return () => false
    }

    const compare = (stringB) => isString(stringB) && stringA.toLowerCase() === stringB.toLowerCase()
    return compare
  }
}

export const ThrowOn = (error, message) => {
  if (error) {
    throw message
  }
}

export const inArray = (...args) => {
  if (args.length === 1) {
    const item = args[0]
    return (someArray) => someArray.indexOf(item) >= 0
  }

  if (args.length >= 2) {
    const [item, someArray] = args
    return someArray.indexOf(item) >= 0
  }
}

export const onlyKeys = (...keys) => (obj) => {
  const result = {}

  keys.forEach((key) => {
    result[key] = obj[key]
  })

  return result
}

export const unique = (array) => array.filter((item, index) => array.indexOf(item) === index)

export const uniqueBy = (...args) => {
  const baseFunc = (array, key) => array.filter((item, index) => array.findIndex((i) => i[key] === item[key]) === index)

  if (args.length === 2) {
    return baseFunc(...args)
  }

  // When more than one argument, we use curry
  if (args.length === 1 && typeof args[0] === 'string') {
    const key = args[0]
    return (array) => baseFunc(array, key)
  }
}

export const sequence = (from = 0, to = 10, mapper = i => i) => Array.from({ length: to - from })
  .fill()
  .map((_, idx) => idx + from)
  .map(mapper)

export const times = (func, length) => Array.from({ length }).map(func)

export const toDict = (list, ...args) => {
  const baseFunc = key => {
    const result = {}
    list.forEach(item => { result[item[key]] = item })
    return result
  }

  const curried = str => baseFunc(str)
  return isString(args[0]) ? baseFunc(args[0]) : curried
}

export class TabMap {
  constructor(...args) {
    if (args.length < 2 || args.some((v) => typeof v !== 'string')) {
      throw new Error('Invalid constructor params for TabMap')
    }

    args.forEach((value, index) => {
      Object.defineProperties(this, {
        [value.toLowerCase().replace(/\s+/g, '_')]: {
          value: value,
          writable: false,
        },
        [index]: {
          value: value,
          writable: false,
        },
      })
    })

    this._length = args.length
    this._values = args
    this._keys = args.map((v) => v.toLowerCase())
    this._valueArray = [...args]
    return this
  }

  get length() {
    return this._length
  }

  get values() {
    return this._values
  }

  get keys() {
    return this._keys
  }

  getByIndex(index) {
    return this.values[index]
  }

  map(...args) {
    return this.values.map(...args)
  }

  getIndex(value) {
    return this._valueArray.indexOf(value)
  }
}
