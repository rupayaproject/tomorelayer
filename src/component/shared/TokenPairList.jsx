import React from 'react'
import { connect } from '@vutr/redux-zero/react'
import {
  Button,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@material-ui/core'
import LoadSpinner from 'component/utility/LoadSpinner'


class TokenPairList extends React.Component {

  FILTER_CONTROLS = {
    ALL: pair => pair,
    SEARCH: str => pair => {
      if (!str || !str.length) return true
      const regex = new RegExp(str, 'i')
      const searchField = `${pair.toString()}${pair.from.name}${pair.to.name}`
      return regex.exec(searchField)
    }
  }

  state = {
    activeFilter: 'ALL',
    searchText: undefined,
    debounceText: '',
    isSearching: false,
  }

  componentDidMount() {
    this.props.quoteTokens.forEach(t => {
      const symbol = t.symbol
      this.FILTER_CONTROLS[symbol] = pair => pair.from.symbol === symbol || pair.to.symbol === symbol
    })
  }

  componentDidUpdate(prevProps, prevStates) {
    const {
      debounceText,
      activeFilter,
    } = this.state

    const searchActive = debounceText.length > 0 && debounceText !== prevStates.debounceText

    if (searchActive && activeFilter !== 'SEARCH') {
      this.setState({ activeFilter: 'SEARCH' })
    }

    if (searchActive) {
      this.setState({ isSearching: true })
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        this.debounce = undefined
        this.setState({ searchText: this.state.debounceText, isSearching: false })
      }, 1000)
    }

    if (activeFilter !== 'SEARCH' && prevStates.activeFilter === 'SEARCH') {
      clearTimeout(this.debounce)
      this.debounce = undefined
      this.setState({ searchText: undefined, debounceText: '' })
    }

  }

  debounce = undefined

  setFilter = activeFilter => () => {
    this.setState({ activeFilter })
  }

  searchInputChange = e => this.setState({ debounceText: e.target.value })

  handleItemClick = pair => () => {
    if (this.props.disabled) return undefined
    const index = this.props.pairs.indexOf(pair)
    const newList = Array.from(this.props.pairs)
    newList[index].checked = !newList[index].checked
    const checkedList = newList.filter(p => p.checked)
    return this.props.onChange(checkedList)
  }

  makeCheckList = (pairs, pairMapping, value) => {
    const result = Array.from(pairs)
    const mappingKeys = value.from_tokens.map((from, idx) => `${from}${value.to_tokens[idx]}`)
    mappingKeys.forEach(key => {
      const pairIndex = pairMapping[key]

      if (pairIndex === undefined) {
        // TODO: check and save this token to Database then return it as normal
        console.warn(`This token ${key} is not found in Database`)
        return
      }

      result[pairIndex].checked = true
    })
    return result
  }

  render() {
    const {
      quoteTokens,
      pairs,
      pairMapping,
      value,
      disabled,
    } = this.props

    const checkList = this.makeCheckList(pairs, pairMapping, value)
    const {
      searchText,
      activeFilter,
      isSearching,
    } = this.state

    const filterFunction = activeFilter !== 'SEARCH' ? this.FILTER_CONTROLS[activeFilter] : this.FILTER_CONTROLS[activeFilter](searchText)

    return (
      <Box border={1}>
        <Box display="flex" justifyContent="space-around" alignItems="center" borderBottom={1}>
          <Button onClick={this.setFilter('ALL')} type="button" size="small" className="m-1">
            ALL
          </Button>
          {quoteTokens.map(token => (
            <Button key={token.address} onClick={this.setFilter(token.symbol)} type="button" size="small" className="m-1">
              {token.symbol}
            </Button>
          ))}
          <TextField
            name="search-input"
            type="text"
            value={this.state.debounceText}
            placeholder="Search"
            onChange={this.searchInputChange}
            fullWidth
            className="m-1"
            variant="outlined"
            margin="dense"
          />
        </Box>
        <Box style={{ position: 'relative' }}>
          {isSearching && (
            <div className="search-overlay">
              <LoadSpinner />
            </div>
          )}
          <List dense className="bg-filled token-list token-list__limited-height" style={{ maxHeight: 300, overflow: 'scroll' }}>
            {checkList.filter(filterFunction).map(p => (
              <ListItem key={p.toString()} className="pr-1 pl-1 pointer pair-item" onClick={this.handleItemClick(p)}>
                <ListItemIcon>
                  <Checkbox
                    color="default"
                    checked={p.checked}
                    disabled={disabled}
                    inputProps={{
                      'aria-label': p.toString(),
                    }}
                  />
                </ListItemIcon>
                <ListItemText primary={p.toString()}/>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    )
  }
}

export const mapProps = state => {
  // NOTE: this paring funcion will be quite expensive if the number of tokens is big enough
  // Must consider memoization by then
  const Tokens = state.Tokens

  const pairs = []

  // NOTE: due to concern over the excessive size of token-pairs array each relayer may has,
  // we keep a special Object called `pairMapping` utilizing `fromAddress/toAddress` as key
  // and `index` of the pair in array pair - for faster query/retrieve data
  // the object, being memoized as well, should be saved in the store for referrence
  const pairMapping = {}

  Tokens.forEach((fromToken, fromIdx) => {
    Tokens.filter((toToken, toIdx) => {
      if (fromIdx === toIdx) return false
      if (toToken.is_major) return true
      if (!fromToken.is_major) return true
      return false
    }).forEach((toToken, toIdx) => pairs.push({
      from: fromToken,
      to: toToken,
      toString: () => `${fromToken.symbol}/${toToken.symbol}`,
      checked: false,
    }))
  })

  pairs.sort((a, b) => {
    if (a.from.symbol === b.from.symbol) return 1 * a.to.symbol.localeCompare(b.to.symbol)
    if (a.from.symbol === 'TOMO') return -1
    if (a.from.is_major && b.from.is_major) return 1 * a.from.symbol.localeCompare(b.from.symbol)
    return 1 * a.from.symbol.localeCompare(b.from.symbol)
  })

  pairs.forEach((p, idx) => {
    pairMapping[`${p.from.address}${p.to.address}`] = idx
  })

  return {
    pairs,
    pairMapping,
    quoteTokens: Tokens.filter(t => t.is_major),
  }
}

const storeConnect = connect(mapProps)

export default storeConnect(TokenPairList)
