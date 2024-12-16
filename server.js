const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/create-invoice', async (req, res) => {
    try {
        const response = await fetch('https://api.nanopay.me/invoices', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${req.body.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: req.body.title,
                price: req.body.amount,
                recipient_address: req.body.address,
                redirect_url: req.body.redirect_url
            })
        });
        
        const invoice = await response.json();
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Demo server running on port 3000');
}); 