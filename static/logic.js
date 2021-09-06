Moralis.initialize(""); //application ID
Moralis.serverURL = ""; //ServerURL

/* Valid values for chain in https://docs.moralis.io/moralis-server/transactions-and-balances/intro */
const chainToQuery = "bsc testnet" 
// Dan Token address 
const tokenAddress ="0x7eaaf8070ec57474af786f687ca3c940710d1c8d" //

async function login(){
    Moralis.Web3.authenticate().then(function(user){
        user.set("name", document.getElementById("username").value);
        user.set("email", document.getElementById("email").value);
        user.save();
        setControls();
    })
}

async function setControls(){
    const nativeBalance = document.getElementById("nativeBalance");
    const tokenBalance = document.getElementById("tokenBalance");
    const nBalance = await Moralis.Web3API.account.getNativeBalance({chain: chainToQuery}).then(function(balance){
        nativeBalance.value = balance.balance/10**18
    })
    const tBalance = await Moralis.Web3API.account.getTokenBalances({chain: chainToQuery}).then(function(balances){
        for (i=0;i<balances.length; i++){
            if (balances[i].token_address == tokenAddress){
                tokenBalance.value = balances[i].balance /10**18
            }
        }
    })
    document.getElementById("username").setAttribute("disabled", null);
    document.getElementById("email").setAttribute("disabled", null);
    document.getElementById("login").setAttribute("disabled", null);
    document.getElementById("nativeAmount").removeAttribute("disabled");
    document.getElementById("nativeTransferTo").removeAttribute("disabled");
    document.getElementById("transferNative").removeAttribute("disabled");
    document.getElementById("tokenAmount").removeAttribute("disabled");
    document.getElementById("tokenTransferTo").removeAttribute("disabled");
    document.getElementById("transferToken").removeAttribute("disabled");
}

function displayMessage(messageType,message){
    messages = {
        "00":`<div class="alert alert-success"> ${message} </div>`,
        "01":`<div class="alert alert-danger"> ${message} </div>`
    }
    document.getElementById("resultSpace").innerHTML = messages[messageType]
}

function transferNative(){
    const balance = document.getElementById("nativeBalance").value;
    const transferValue = document.getElementById("nativeAmount").value;
    const transferTo = document.getElementById("nativeTransferTo").value;
    (transferValue <= balance) ? _transferNative(transferTo, transferValue): displayMessage("01","Your balance is not enough");
}

function transferToken(){
    const balance = document.getElementById("tokenBalance").value;
    const transferValue = document.getElementById("tokenAmount").value;
    const transferTo = document.getElementById("tokenTransferTo").value;
    (transferValue <= balance) ? _transferToken(transferTo, transferValue): displayMessage("01","Your balance is not enough");
}

async function _transferNative(transferTo, transferValue){
    const options = {type: "native", amount: Moralis.Units.ETH(transferValue), receiver: transferTo}
    let result = await Moralis.transfer(options)
    setControls()
    displayMessage("00","Transaction processed at " + result.transactionHash)
}

async function _transferToken(transferTo, transferValue){
    const options = {type: "erc20", 
                 amount: Moralis.Units.Token(transferValue, "18"), 
                 receiver: transferTo,
                 contract_address: tokenAddress}
    let result = await Moralis.transfer(options)
    setControls()
    displayMessage("00","Transaction processed at " + result.transactionHash)
}



