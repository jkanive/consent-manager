import EventEmitter from 'events'
import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import Banner from './banner'
import Dialog from './dialog'
import {ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES} from './categories'

const emitter = new EventEmitter()

export function openDialog() {
  emitter.emit('openDialog')
}

export default class Container extends PureComponent {
  static displayName = 'Container'

  static propTypes = {
    setPreferences: PropTypes.func.isRequired,
    saveConsent: PropTypes.func.isRequired,
    destinations: PropTypes.arrayOf(PropTypes.object).isRequired,
    newDestinations: PropTypes.arrayOf(PropTypes.object).isRequired,
    preferences: PropTypes.object.isRequired,
    isEnforcingConsent: PropTypes.bool.isRequired,
  }

  state = {
    isDialogOpen: false,
  }

  render() {
    const {
      destinations,
      newDestinations,
      preferences,
      isEnforcingConsent,
    } = this.props
    const {isDialogOpen} = this.state
    const marketingDestinations = []
    const advertisingDestinations = []
    const functionalDestinations = []

    for (const destination of destinations) {
      if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
        advertisingDestinations.push(destination)
      } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
        functionalDestinations.push(destination)
      } else {
        // Fallback to marketing
        marketingDestinations.push(destination)
      }
    }

    return (
      <div>
        {isEnforcingConsent &&
          newDestinations.length > 0 && (
            <Banner
              onAccept={this.allowAllTracking}
              onChangePreferences={this.openDialog}
            />
          )}
        {isDialogOpen && (
          <Dialog
            onCancel={this.closeDialog}
            onSave={this.handleSave}
            onChange={this.handleCategoryChange}
            marketingDestinations={marketingDestinations}
            advertisingDestinations={advertisingDestinations}
            functionalDestinations={functionalDestinations}
            marketingAllowed={preferences.marketingAllowed}
            advertisingAllowed={preferences.advertisingAllowed}
            functionalAllowed={preferences.functionalAllowed}
          />
        )}
      </div>
    )
  }

  componentDidMount() {
    emitter.on('openDialog', this.openDialog)
  }

  componentWillUnmount() {
    emitter.removeListener('openDialog', this.openDialog)
  }

  allowAllTracking = () => {
    const {saveConsent} = this.props

    saveConsent(true)
    this.setState({
      isDialogOpen: false,
    })
  }

  openDialog = () => {
    this.setState({
      isDialogOpen: true,
    })
  }

  closeDialog = () => {
    this.setState({
      isDialogOpen: false,
    })
  }

  handleCategoryChange = (category, value) => {
    const {setPreferences} = this.props

    setPreferences({
      [category]: value,
    })
  }

  handleSave = () => {
    const {saveConsent} = this.props

    saveConsent()
    this.setState({
      isDialogOpen: false,
    })
  }
}
