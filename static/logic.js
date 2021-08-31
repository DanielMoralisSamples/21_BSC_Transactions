Moralis.initialize(""); //application ID
Moralis.serverURL = ""; //ServerURL

const chainToQuery = "bsc testnet"
const tokenAddress ="0x7eaaf8070ec57474af786f687ca3c940710d1c8d"

const web3 = new Web3(window.ethereum);

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
    (transferValue <= balance && transferValue <= 999) ? _transferNative(transferTo, transferValue): displayMessage("01","Your balance is not enough or surpases integer limit");
}

function transferToken(){
    const balance = document.getElementById("tokenBalance").value;
    const transferValue = document.getElementById("tokenAmount").value;
    const transferTo = document.getElementById("tokenTransferTo").value;
    (transferValue <= balance && transferValue <= 999) ? _transferToken(transferTo, transferValue): displayMessage("01","Your balance is not enough or surpases integer limit");
}

//Blockchain has no decimals, we have to transform everything to integers
//Blockchain EVM works in hexadecimal values

async function _transferNative(transferTo, transferValue){
    const blockchainValue = codeValue(transferValue,16);
    const transactionParameters = {
        to: transferTo,
        from: ethereum.selectedAddress,
        value: blockchainValue
    }
    const txtHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    }) 
    displayMessage("00",txtHash)
}

async function _transferToken(transferTo, transferValue){
    const blockchainValue = codeValue(transferValue,10);
    const encodedFunction = web3.eth.abi.encodeFunctionCall({
        name:"transfer",
        type:"function",
        inputs: [{
            type:"address",
            name:"_to"},
            {
            type:"uint256",
            name:"_value"
            }]
    },[transferTo,blockchainValue]);
    const transactionParameters = {
        to: tokenAddress,
        from: ethereum.selectedAddress,
        data: encodedFunction
    }
    const txtHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    }) 
    displayMessage("00",txtHash)
}

function codeValue(_value,_encoding){
    const result = parseInt(web3.utils.toWei(_value,"ether")).toString(_encoding)
    return result;
}