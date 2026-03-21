import 'dotenv/config'

import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const mnemonic = process.env.WDK_MNEMONIC

if (!mnemonic) {
  console.error('Missing WDK_MNEMONIC in environment variables.')
  process.exit(1)
}

const config = {
  ethereumRpc: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
  solanaRpc: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
}

async function getAddressAndBalance(wdk, walletKey, unit) {
  try {
    const account = await wdk.getAccount(walletKey, 0)

    try {
      const [address, balance] = await Promise.all([
        account.getAddress(),
        account.getBalance()
      ])

      return { ok: true, address, balance: balance.toString(), unit }
    } finally {
      account.dispose()
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error), unit }
  }
}

function printChainResult(label, moduleName, result) {
  console.log(`${label} (${moduleName}):`)

  if (!result.ok) {
    console.log(`  Error: ${result.error}`)
    return
  }

  console.log(`  Address: ${result.address}`)
  console.log(`  Balance: ${result.balance} ${result.unit}`)
}

async function main() {
  const wdk = new WDK(mnemonic)
    .registerWallet('ethereum', WalletManagerEvm, {
      provider: config.ethereumRpc
    })
    .registerWallet('solana', WalletManagerSolana, {
      rpcUrl: config.solanaRpc
    })

  const [ethereum, solana] = await Promise.all([
    getAddressAndBalance(wdk, 'ethereum', 'wei'),
    getAddressAndBalance(wdk, 'solana', 'lamports')
  ])

  console.log('\nWallet addresses and balances (account index 0):\n')
  printChainResult('Ethereum', 'wdk-wallet-evm', ethereum)
  printChainResult('Solana  ', 'wdk-wallet-solana', solana)
}

main().catch((error) => {
  console.error('\nFailed to initialize WDK wallet app:')
  console.error(error)
  process.exit(1)
})
