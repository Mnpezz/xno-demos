// Demo functions for each payment method
function demoNanoTo() {
    const address = document.getElementById('nanoto-address').value;
    const amount = document.getElementById('nanoto-amount').value;
    const notify = document.getElementById('nanoto-notify').value;
    const showContact = document.getElementById('nanoto-contact').checked;
    const enableShipping = document.getElementById('nanoto-shipping').checked;
    const currency = document.getElementById('nanoto-currency').value;
    const wallet = document.getElementById('nanoto-wallet').value;

    NanoPay.open({ 
        title: "Demo Payment",
        address: address,
        amount: parseFloat(amount),
        notify: notify,
        contact: showContact,
        shipping: enableShipping ? {
            onShippingUpdate: function(details) {
                console.log('Shipping details:', details);
                return true;
            }
        } : false,
        currency: currency,
        wallet: wallet,
        button: `Open ${wallet.charAt(0).toUpperCase() + wallet.slice(1)}`,
        onShippingUpdate: function(details) { return true; },
        success: (block) => {
            console.log('Payment details:', block);
            alert(`Payment successful!\n\nBlock hash: ${block.hash}${block.shipping ? '\nShipping: ' + block.shipping : ''}${block.email ? '\nEmail: ' + block.email : ''}`);
        }
    });
}

// NanoPay.me demo function
function demoNanopayMe() {
    const apiKey = document.getElementById('nanopay-api-key').value;
    const title = document.getElementById('nanopay-title').value;
    const amount = document.getElementById('nanopay-amount').value;
    const address = document.getElementById('nanopay-address').value;
    const redirect = document.getElementById('nanopay-redirect').value;
    
    if (!apiKey || !address) {
        alert('Please enter a recipient address');
        return;
    }
    
    fetch('https://api.nanopay.me/invoices', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            title: title,
            price: parseFloat(amount),
            recipient_address: address,
            redirect_url: redirect || window.location.href
        })
    })
    .then(response => response.json())
    .then(invoice => {
        if (invoice.error) {
            throw new Error(invoice.error);
        }
        if (invoice.pay_url) {
            window.location.href = invoice.pay_url;
        } else {
            throw new Error('Invalid response from server');
        }
    })
    .catch(error => {
        alert('Error creating invoice: ' + error.message + '\n\nNote: You may need to use a backend implementation due to CORS restrictions.');
    });
}

// BitRequest demo function
function demoBitRequest() {
    const address = document.getElementById('bitrequest-address').value;
    const amount = document.getElementById('bitrequest-amount').value;
    const title = document.getElementById('bitrequest-title').value;
    const name = document.getElementById('bitrequest-name').value;
    const showContact = document.getElementById('bitrequest-contact').checked;
    
    if (!address) {
        alert('Please enter a Nano address');
        return;
    }
    
    // Create data object for encoding
    const data = {
        n: name,
        t: title,
        c: 0
    };
    
    // Build URL with parameters
    const params = new URLSearchParams({
        payment: 'nano',
        uoa: 'usd',
        amount: amount,
        address: address,
        d: btoa(JSON.stringify(data))
    });
    
    if (showContact) {
        params.append('contactform', 'true');
    }
    
    // Redirect to BitRequest
    const url = `https://bitrequest.github.io/?${params.toString()}`;
    window.location.href = url;
}

// WowPay demo functions
function demoWowPayDeposit() {
    const apiKey = document.getElementById('wowpay-api-key').value;
    const privateKey = document.getElementById('wowpay-private-key').value;
    const currency = document.getElementById('wowpay-currency').value;
    
    if (!apiKey || !privateKey) {
        alert('Please enter your API key and private key');
        return;
    }
    
    const timestamp = Date.now();
    const body = JSON.stringify({
        currency: currency,
        time: timestamp
    });
    
    // Create signature using CryptoJS (we need to add the library)
    const signature = CryptoJS.HmacSHA256(body, privateKey).toString(CryptoJS.enc.Base64);
    
    fetch('https://nanpay.pilou.cc/wallet/deposit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth': apiKey,
            'sign': signature
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        if (data.address) {
            showPaymentModal({
                address: data.address,
                amount: document.getElementById('wowpay-amount').value,
                currency: currency.toUpperCase()
            });
        } else {
            throw new Error('Invalid response from server');
        }
    })
    .catch(error => {
        alert('Error creating deposit address: ' + error.message);
    });
}

function demoWowPayWithdraw() {
    const apiKey = document.getElementById('wowpay-api-key').value;
    const privateKey = document.getElementById('wowpay-private-key').value;
    const currency = document.getElementById('wowpay-currency').value;
    const amount = document.getElementById('wowpay-amount').value;
    
    // Prompt for destination address
    const destination = prompt(`Enter the ${currency.toUpperCase()} address to withdraw to:`);
    
    if (!destination) {
        return;
    }
    
    if (!apiKey || !privateKey) {
        alert('Please enter your API key and private key');
        return;
    }
    
    const timestamp = Date.now();
    const body = JSON.stringify({
        currency: currency,
        time: timestamp,
        amount: parseFloat(amount),
        destination: destination
    });
    
    // Create signature
    const signature = CryptoJS.HmacSHA256(body, privateKey).toString(CryptoJS.enc.Base64);
    
    fetch('https://nanpay.pilou.cc/wallet/withdraw', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth': apiKey,
            'sign': signature
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        alert(`Withdrawal Created!\n\nAmount: ${amount} ${currency.toUpperCase()}\nDestination: ${destination}\n\nCheck your transaction history for details.`);
    })
    .catch(error => {
        alert('Error creating withdrawal: ' + error.message);
    });
}

// Helper function to handle the withdrawal process
function promptAndWithdraw(apiKey, privateKey, currency, amount) {
    // Prompt for destination address
    const destination = prompt(`Enter the ${currency.toUpperCase()} address to withdraw to:`);
    
    if (!destination) {
        return;
    }
    
    const timestamp = Date.now();
    const body = JSON.stringify({
        currency: currency,
        time: timestamp,
        amount: amount,
        destination: destination
    });
    
    // Create signature
    const signature = CryptoJS.HmacSHA256(body, privateKey).toString(CryptoJS.enc.Base64);
    
    return fetch('https://nanpay.pilou.cc/wallet/withdraw', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth': apiKey,
            'sign': signature
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        alert(`Withdrawal Created!\n\nAmount: ${amount} ${currency.toUpperCase()}\nDestination: ${destination}\n\nCheck your transaction history for details.`);
    })
    .catch(error => {
        throw new Error('Withdrawal failed: ' + error.message);
    });
}

// Function to copy code example
function copyCodeExample(button) {
    const codeBlock = button.parentElement.querySelector('code');
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        // Visual feedback
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.textContent = 'Copy Code';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code:', err);
        alert('Failed to copy code to clipboard');
    });
}

// Add more demo functions for other payment methods 

// Function to show payment modal
function showPaymentModal(paymentDetails) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    
    // Generate QR code
    const rawAmount = paymentDetails.amount ? BigInt(parseFloat(paymentDetails.amount) * Math.pow(10, 30)).toString() : '';
    const qrData = `${paymentDetails.currency.toLowerCase()}:${paymentDetails.address}${rawAmount ? '?amount=' + rawAmount : ''}`;
    
    modal.innerHTML = `
        <div class="payment-modal-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <h3>Send ${paymentDetails.currency}</h3>
            <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}" alt="QR Code">
            </div>
            <div class="payment-details">
                <div class="detail-group">
                    <label>Amount:</label>
                    <div class="detail-value">${paymentDetails.amount} ${paymentDetails.currency}</div>
                </div>
                <div class="detail-group">
                    <label>Address:</label>
                    <div class="detail-value address">
                        ${paymentDetails.address}
                        <button class="copy-btn" onclick="copyToClipboard('${paymentDetails.address}')">Copy</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Helper function to copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Address copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}