import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core'
import { connect } from '@vutr/redux-zero/react'
import { compose } from 'service/helper'
import { PushAlert } from 'service/frontend'
import { UpdateRelayer } from '../actions'
import { wrappers } from './forms'
import { TransferNotice } from './PresentComponents'


const FormTransfer = props => {
  const {
    handleChange,
    handleSubmit,
    values,
    errors,
    submitForm,
    isSubmitting,
    relayer,
  } = props

  const [step, setStep] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const confirmAndClose = () => {
    handleClose()
    submitForm()
  }

  const transferDisabled = isSubmitting || values.owner === relayer.owner

  const nextStep = () => setStep(1)

  if (relayer.resigning) {
    return (
      <Container className="border-all border-rounded p-5" maxWidth="xl">
        <Typography component="h5">
          <Box>
            <Typography component="h4">
              This relayer has been requested to deactivated. Transferring relayer is not allowed.
            </Typography>
          </Box>
        </Typography>
      </Container>
    )
  }

  return (
    <Container className="border-all border-rounded p-5" maxWidth="xl">
      {step === 0 && <TransferNotice confirm={nextStep} />}
      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <Grid container direction="column" spacing={3}>
            <Grid item className="mb-2">
              <Typography component="h1">
                Transfer Relayer
              </Typography>
            </Grid>
            <Grid item>
              <Typography component="h5">
                Which address and coinbase would you like to transfer to?
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                label="New Owner"
                value={values.owner}
                onChange={handleChange}
                error={Boolean(errors.owner)}
                name="owner"
                inputProps={{
                  'data-testid': 'new-owner-input'
                }}
                helperText={errors.owner && <i className="text-alert">{errors.owner}</i>}
                fullWidth
              />
            </Grid>
            <Grid item>
              <TextField
                label="New Coinbase"
                value={values.coinbase}
                onChange={handleChange}
                error={Boolean(errors.coinbase)}
                name="coinbase"
                inputProps={{
                  'data-testid': 'new-coinbase-input'
                }}
                helperText={errors.coinbase && <i className="text-alert">{errors.coinbase}</i>}
                fullWidth
              />
            </Grid>
            <Grid item className="mt-4">
              <Box display="flex" justifyContent="flex-end">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleClickOpen}
                  disabled={transferDisabled}
                  data-testid="transfer-button"
                >
                  Transfer
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">WARNING!</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                If you use this site regularly and would like to help keep the site on the Internet, please consider donating a small sum to help pay for the hosting and bandwidth bill.
              </DialogContentText>
            </DialogContent>
            <Box display="flex" justifyContent="space-between" className="p-1">
              <Button
                onClick={handleClose}
                color="primary"
                data-testid="cancel-transfer-request"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAndClose}
                color="secondary"
                variant="contained"
                autoFocus
                disabled={transferDisabled}
                data-testid="accept-button"
              >
                Accept
              </Button>
            </Box>
          </Dialog>
        </form>
      )}
    </Container>
  )
}

const mapProps = state => ({
  RelayerContract: state.blk.RelayerContract,
  invalidCoinbases: state.Relayers.map(t => t.owner).concat(state.Relayers.map(t => t.coinbase)),
  invalidOwnerAddresses: state.Relayers.map(t => t.coinbase),
})

const actions = {
  UpdateRelayer,
  PushAlert,
}

const storeConnect = connect(mapProps, actions)
const formConnect = wrappers.transferForm
export default compose(formConnect, storeConnect, withRouter)(FormTransfer)
