// Required libraries
const express = require("express");
const axios = require('axios');
const UssdMenu = require("ussd-builder");
const { sendEmail } = require('./email');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
require("dotenv").config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const emailRegex = /\S+@\S+\.\S+/;


const events = [
    { name: "Naivasha Rally", options: ["Early", "VIP", "VVIP"], prices: [250, 1000, 10000] },
    { name: "Sauti Sol", options: ["General", "VIP", "VVIP"], prices: [200, 800, 12000] },
    { name: "JULIANI FAMILY TOUR", options: ["ADVANCE", "GATE", "VIP "], prices: [1000, 1500, 3000] }
    // Add more events as needed
];

// Initialize USSD menu
let menu = new UssdMenu();

// State to start the USSD session
menu.startState({
    run: () => {
        // Display events
        const eventText = events.map((event, index) => `${index + 1}. ${event.name}`).join('\n');
        menu.con('Welcome to TIKITI:\n' + eventText);
    },
    next: {
        '*': 'selectEvent'
    }
});

// State for selecting event
menu.state('selectEvent', {
    run: () => {
        const userInput = parseInt(menu.val);
        if (userInput >= 1 && userInput <= events.length) {
            selectedEvent = events[userInput - 1];
            // Display ticket options and prices
            const optionsText = selectedEvent.options.map((option, index) => `${index + 1}. ${option}: Ksh ${selectedEvent.prices[index]}`).join('\n');
            menu.con(`${selectedEvent.name}\nSelect ticket option:\n${optionsText}`);
        } else {
            menu.end('Invalid event selection. Please try again.');
        }
    },
    next: {
        '*': 'confirmTicketOption'
    }
});

// State for confirming ticket option
menu.state('confirmTicketOption', {
    run: () => {
        const userInput = parseInt(menu.val);
        if (userInput >= 1 && userInput <= selectedEvent.options.length) {
            const selectedOptionIndex = userInput - 1;
            selectedOption = selectedEvent.options[selectedOptionIndex];
            selectedPrice = selectedEvent.prices[selectedOptionIndex];
            // Ask for number of tickets
            menu.con(`How many ${selectedOption} tickets do you require? (Max 10):`);
        } else {
            menu.end('Invalid option selection. Please try again.');
        }
    },
    next: {
        '*': 'confirmNumberOfTickets'
    }
});

// State for confirming number of tickets
menu.state('confirmNumberOfTickets', {
    run: () => {
        const userInput = parseInt(menu.val);
        if (userInput >= 1 && userInput <= 10) {
            numberOfTickets = userInput;
            // Calculate total price
            const totalPrice = selectedPrice * numberOfTickets;
            menu.con(`You have selected ${numberOfTickets} ticket(s)\nTotal Price: Ksh ${totalPrice}.\nPlease enter your email:`);
        } else {
            menu.con('Invalid number of tickets. Please enter a number between 1 and 10:');
        }
    },
    next: {
        '*': 'confirmEmail'
    }
});

// State for confirming email
menu.state('confirmEmail', {
    run: async () => {
        const userEmail = menu.val.trim();
        // Validate email format
        if (emailRegex.test(userEmail)) {
            const currentDate = new Date();
            const purchaseDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

            const confirmationMessage = `Your selection:\nEvent: ${selectedEvent.name}\nTicket Option: ${selectedOption}: Ksh ${selectedPrice}\nNumber of Tickets: ${numberOfTickets}\nTotal Price: Ksh ${selectedPrice * numberOfTickets}\nEmail: ${userEmail}\nDate Purchased: ${purchaseDate}\nThank you for your confirmation.`;

            // Generate PDF content with QR code
            const pdfBuffer = await generatePDF(selectedEvent.name, selectedOption, selectedPrice, numberOfTickets, userEmail, purchaseDate);

            // Send email with PDF attachment
            sendEmail(userEmail, 'Ticket Confirmation', 'Your ticket confirmation is attached.', pdfBuffer);

            menu.end('Thank you');
        } else {
            menu.con('Invalid email format. Please enter a valid email:');
        }
    },
    next: {
        '*': 'confirmEmail'
    }
});


// Function to generate PDF content with QR code
async function generatePDF(event, option, price, numberOfTickets, email, purchaseDate) {
    let doc = new PDFDocument();
    let content = `Your selection:\nEvent: ${event}\nTicket Option: ${option}: Ksh ${price}\nNumber of Tickets: ${numberOfTickets}\nTotal Price: Ksh ${price * numberOfTickets}\nEmail: ${email}\nDate Purchased: ${purchaseDate}\nThank you for your confirmation.`;

    doc.text(content);

    // Generate QR code image
    const qrCodeData = `Event: ${event}\nOption: ${option}\nPrice: Ksh ${price}\nNumber of Tickets: ${numberOfTickets}\nEmail: ${email}\nDate Purchased: ${purchaseDate}`;
    const qrCodeImageBuffer = await QRCode.toBuffer(qrCodeData);

    // Embed QR code image into PDF
    doc.image(qrCodeImageBuffer, { fit: [250, 250], align: 'center', valign: 'center' });

    return new Promise(resolve => {
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
        doc.end();
    });
}


// Route to handle USSD requests
app.post('/ussd', async (req, res) => {
    let args = {
        phoneNumber: req.body.phoneNumber,
        sessionId: req.body.sessionId,
        serviceCode: req.body.serviceCode,
        text: req.body.text
    };

    let resMsg = await menu.run(args);
    res.send(resMsg);
});

// Route to check if the server is running
app.get('/', (req, res) => {
    res.send("Server is running.");
});

// Start server
const port = process.env.PORT || 2000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
