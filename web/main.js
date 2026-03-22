import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm'

const STEP_TITLES = [
  'Connect Wallet',
  'Create GC Wallet',
  'Deposit Destination',
  'Transfer Suggestion',
  'Deposit Amount',
  'Review Order',
  'Deposit Status'
]

const NETWORKS = {
  ethereum: 'Ethereum',
  base: 'Base'
}

const state = {
  step: 1,
  provider: null,
  walletAddress: '',
  gcWalletAddress: '',
  useAA: true,
  network: 'ethereum',
  depositAmount: '',
  statusTimer: null
}

const el = {
  view: document.getElementById('view'),
  stepLabel: document.getElementById('stepLabel'),
  stepTitle: document.getElementById('stepTitle'),
  progressFill: document.getElementById('progressFill'),
  connectedWallet: document.getElementById('connectedWallet'),
  gcWallet: document.getElementById('gcWallet'),
  selectedNetwork: document.getElementById('selectedNetwork'),
  depositAmount: document.getElementById('depositAmount')
}

function shortAddress(address) {
  if (!address || address.length < 10) return address || '-'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function updateHeader() {
  el.stepLabel.textContent = `Step ${state.step} of 7`
  el.stepTitle.textContent = STEP_TITLES[state.step - 1]
  el.progressFill.style.width = `${(state.step / 7) * 100}%`
}

function updateSnapshot() {
  el.connectedWallet.textContent = state.walletAddress ? shortAddress(state.walletAddress) : 'Not connected'
  el.gcWallet.textContent = state.gcWalletAddress ? shortAddress(state.gcWalletAddress) : 'Not created'
  el.selectedNetwork.textContent = NETWORKS[state.network]
  el.depositAmount.textContent = state.depositAmount ? `${state.depositAmount} USDT` : '0.00 USDT'
}

function setStep(step) {
  state.step = step
  updateHeader()
  renderStep()
  updateSnapshot()
}

function loadTemplate(id) {
  const tpl = document.getElementById(id)
  if (!tpl) throw new Error(`Template not found: ${id}`)
  el.view.replaceChildren(tpl.content.cloneNode(true))
}

function mustHaveEthereum() {
  if (!window.ethereum) {
    alert('No EVM wallet found. Install MetaMask or another injected wallet.')
    return false
  }
  return true
}

async function connectWallet() {
  if (!mustHaveEthereum()) return

  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])

  state.provider = provider
  state.walletAddress = await (await provider.getSigner()).getAddress()
  setStep(2)
}

async function createGcWallet() {
  if (!state.walletAddress) return

  const nonce = ethers.hexlify(ethers.randomBytes(32))
  const seed = ethers.solidityPacked(['address', 'bytes32', 'uint256'], [state.walletAddress, nonce, Date.now()])

  const digest = ethers.keccak256(seed)
  const aaOrDerivedAddress = ethers.getAddress(`0x${digest.slice(-40)}`)

  state.gcWalletAddress = aaOrDerivedAddress
  setStep(3)
}

function renderStep1() {
  loadTemplate('tplStep1')
  const connectBtn = document.getElementById('connectBtn')
  const connectStatus = document.getElementById('connectStatus')

  connectBtn.addEventListener('click', async () => {
    connectStatus.textContent = 'Connecting wallet...'

    try {
      await connectWallet()
    } catch (error) {
      connectStatus.textContent = error instanceof Error ? error.message : String(error)
    }
  })
}

function renderStep2() {
  loadTemplate('tplStep3')
  const aaToggle = document.getElementById('aaToggle')
  const createGcBtn = document.getElementById('createGcBtn')
  const createStatus = document.getElementById('createStatus')

  aaToggle.checked = state.useAA
  aaToggle.addEventListener('change', (event) => {
    state.useAA = event.target.checked
  })

  createGcBtn.addEventListener('click', async () => {
    createStatus.textContent = state.useAA
      ? 'Creating AA-ready GC wallet...'
      : 'Creating mnemonic-derived style GC wallet...'

    try {
      await createGcWallet()
    } catch (error) {
      createStatus.textContent = error instanceof Error ? error.message : String(error)
    }
  })
}

function renderStep3() {
  loadTemplate('tplStep4')
  const depositAddress = document.getElementById('depositAddress')
  const depositNetworkLabel = document.getElementById('depositNetworkLabel')
  const copyAddressBtn = document.getElementById('copyAddressBtn')
  const continueToTransferBtn = document.getElementById('continueToTransferBtn')
  const copyStatus = document.getElementById('copyStatus')

  depositNetworkLabel.textContent = NETWORKS[state.network]
  depositAddress.textContent = state.gcWalletAddress

  copyAddressBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(state.gcWalletAddress)
    copyStatus.textContent = 'Address copied.'
  })

  continueToTransferBtn.addEventListener('click', () => setStep(4))
}

function renderStep4() {
  loadTemplate('tplStep5')

  document.getElementById('fromWallet').textContent = state.walletAddress
  document.getElementById('toWallet').textContent = state.gcWalletAddress
  document.getElementById('tokenNetworkLabel').textContent = NETWORKS[state.network]

  document.getElementById('copyToWalletBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(state.gcWalletAddress)
  })

  document.getElementById('goAmountBtn').addEventListener('click', () => setStep(5))
}

function renderStep5() {
  loadTemplate('tplStep6')

  const networkInput = document.getElementById('networkInput')
  const amountInput = document.getElementById('amountInput')
  const amountContinueBtn = document.getElementById('amountContinueBtn')
  const amountError = document.getElementById('amountError')

  networkInput.value = state.network
  amountInput.value = state.depositAmount

  amountContinueBtn.addEventListener('click', () => {
    state.network = networkInput.value

    const raw = amountInput.value.trim()
    const parsed = Number(raw)

    if (!raw || Number.isNaN(parsed) || parsed <= 0) {
      amountError.textContent = 'Enter a valid amount greater than zero.'
      return
    }

    state.depositAmount = parsed.toFixed(2)
    setStep(6)
  })
}

function renderStep6() {
  loadTemplate('tplStep7')

  document.getElementById('reviewFrom').textContent = state.walletAddress
  document.getElementById('reviewTo').textContent = state.gcWalletAddress
  document.getElementById('reviewAmount').textContent = state.depositAmount
  document.getElementById('reviewNetwork').textContent = NETWORKS[state.network]
  document.getElementById('reviewMode').textContent = state.useAA ? 'Account abstraction' : 'Standard account'

  document.getElementById('confirmOrderBtn').addEventListener('click', () => {
    setStep(7)
    runDepositStatusLifecycle()
  })
}

function runDepositStatusLifecycle() {
  const depositingText = document.getElementById('depositingText')
  const statusPill = document.getElementById('statusPill')

  if (!depositingText || !statusPill) return

  if (state.statusTimer) {
    clearTimeout(state.statusTimer)
  }

  state.statusTimer = setTimeout(() => {
    depositingText.textContent = 'Deposit success. Funds are now linked to your GC account.'
    statusPill.textContent = 'Success'
    statusPill.classList.add('success')
  }, 2200)
}

function resetForNewDeposit() {
  if (state.statusTimer) {
    clearTimeout(state.statusTimer)
    state.statusTimer = null
  }

  state.depositAmount = ''
  setStep(3)
}

function renderStep7() {
  loadTemplate('tplStep8')

  document.getElementById('closeFlowBtn').addEventListener('click', () => {
    alert('Deposit view closed. You can reopen flow anytime.')
  })

  document.getElementById('newDepositBtn').addEventListener('click', () => {
    resetForNewDeposit()
  })
}

function renderStep() {
  const renderer = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
    7: renderStep7
  }[state.step]

  renderer()
}

setStep(1)
