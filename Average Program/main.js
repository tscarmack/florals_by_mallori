// main.js

window.onload = function () {
    retrieveAndDisplayInvoices();
};

function addInvoice() {
    var flowerName = document.getElementById('flowerName').value;
    var amount = parseFloat(document.getElementById('amount').value);
    var price = parseFloat(document.getElementById('price').value);
    var date = document.getElementById('date').value;

    if (isNaN(amount) || isNaN(price)) {
        alert('Please enter valid numbers for amount and price.');
        return;
    }

    // Adjust the date for the timezone offset
    var adjustedDate = new Date(date + 'T00:00:00');
    adjustedDate.setMinutes(adjustedDate.getTimezoneOffset());

    var totalPrice = (amount * price).toFixed(2);

    saveInvoice({ flowerName, amount, price, date: adjustedDate.toISOString(), totalPrice });

    retrieveAndDisplayInvoices();

    // Clear only the flower name, amount, and price fields, leaving the date intact
    document.getElementById('flowerName').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('price').value = '';

    document.getElementById('flowerName').focus(); // Set focus back to the flower name field
}


function saveInvoice(invoice) {
    var existingInvoices = JSON.parse(localStorage.getItem('flowerInvoices')) || [];
    existingInvoices.push(invoice);
    localStorage.setItem('flowerInvoices', JSON.stringify(existingInvoices));
}

function retrieveAndDisplayInvoices() {
    // Reset the deletedInvoices array when displaying invoices
    deletedInvoices = [];

    var storedInvoices = JSON.parse(localStorage.getItem('flowerInvoices')) || [];
    var tableBody = document.getElementById('invoiceTableBody');
    tableBody.innerHTML = '';

    storedInvoices.forEach(function (invoice, index) {
        var newRow = tableBody.insertRow(-1);
        var cells = [
            newRow.insertCell(0),
            newRow.insertCell(1),
            newRow.insertCell(2),
            newRow.insertCell(3),
            newRow.insertCell(4),
            newRow.insertCell(5),
            newRow.insertCell(6) // New cell for season
        ];

        cells[0].textContent = invoice.flowerName;
        cells[1].textContent = invoice.amount;
        cells[2].textContent = '$' + parseFloat(invoice.price).toFixed(2);
        cells[3].textContent = '$' + parseFloat(invoice.totalPrice).toFixed(2);
        var formattedDate = new Date(invoice.date).toLocaleDateString('en-US');
        cells[4].textContent = formattedDate;

        // Calculate and display the season
        var season = getSeason(new Date(invoice.date).getMonth() + 1); // Months are zero-based
        cells[5].textContent = season;

        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            deleteInvoice(storedInvoices.indexOf(invoice));
        });
        
        cells[6].appendChild(deleteButton);
        
    });

    // Attach event listener to the table for delete button clicks
    tableBody.addEventListener('click', function (event) {
        var target = event.target;
        if (target.tagName === 'BUTTON' && target.textContent === 'Delete') {
            // Find the index of the clicked delete button
            var rowIndex = target.closest('tr').rowIndex - 1; // Subtract 1 to account for the header row
            deleteInvoice(rowIndex);
        }
    });
}

function getSeason(month) {
    if (month >= 3 && month <= 5) {
        return 'Spring';
    } else if (month >= 6 && month <= 8) {
        return 'Summer';
    } else if (month >= 9 && month <= 11) {
        return 'Fall';
    } else {
        return 'Winter';
    }
}

function searchInvoices() {
    var searchInput = document.getElementById('searchInput').value.toLowerCase();
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;

    var storedInvoices = JSON.parse(localStorage.getItem('flowerInvoices')) || [];
    var tableBody = document.getElementById('invoiceTableBody');
    tableBody.innerHTML = '';

    storedInvoices.forEach(function (invoice, index) {
        var isMatched = true;

        // Check if the invoice matches the search input
        if (searchInput && !invoice.flowerName.toLowerCase().includes(searchInput)) {
            // If there's a search input and it doesn't match, exclude this invoice
            isMatched = false;
        }

// Check if the invoice is within the date range
if (startDate && endDate) {
    var invoiceDate = new Date(invoice.date);
    var startRange = new Date(startDate);
    var endRange = new Date(endDate);

    // Adjust the timezone offset for startRange and endRange
    startRange.setMinutes(startRange.getTimezoneOffset());
    endRange.setMinutes(endRange.getTimezoneOffset());

    // Adjust the invoice date to include the full day (set hours to 0:0:0)
    invoiceDate.setHours(0, 0, 0, 0);

    // Adjust the endRange to include the full day (set hours to 23:59:59)
    endRange.setHours(23, 59, 59, 999);

    // Check if the invoice date is after or equal to the start date
    // and before or equal to the end date
    isMatched = invoiceDate >= startRange && invoiceDate <= endRange;
}


        if (isMatched) {
            // If the invoice matches the criteria, add a row to the table
            addRowToTable(invoice, index);


        }
    });
}
  
function addRowToTable(invoice, index) {
    var tableBody = document.getElementById('invoiceTableBody');
    var newRow = tableBody.insertRow(-1);
    var cells = [
        newRow.insertCell(0),
        newRow.insertCell(1),
        newRow.insertCell(2),
        newRow.insertCell(3),
        newRow.insertCell(4),
        newRow.insertCell(5),
        newRow.insertCell(6) // New cell for season
    ];

    cells[0].textContent = invoice.flowerName;
    cells[1].textContent = invoice.amount;
    cells[2].textContent = '$' + parseFloat(invoice.price).toFixed(2);
    cells[3].textContent = '$' + parseFloat(invoice.totalPrice).toFixed(2);
    var formattedDate = new Date(invoice.date).toLocaleDateString('en-US');
    cells[4].textContent = formattedDate;

    // Calculate and display the season
    var season = getSeason(new Date(invoice.date).getMonth() + 1); // Months are zero-based
    cells[5].textContent = season;

    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        deleteInvoice(index);
    });

    cells[6].appendChild(deleteButton);
}

function calculateAveragePrice() {
    var flowerNameFilter = document.getElementById('searchInput').value.toLowerCase();
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;

    var storedInvoices = JSON.parse(localStorage.getItem('flowerInvoices')) || [];
    var filteredInvoices = storedInvoices.filter(function (invoice) {
        var isMatched = true;

        // Check if the invoice matches the flower name filter
        if (flowerNameFilter && !invoice.flowerName.toLowerCase().includes(flowerNameFilter)) {
            isMatched = false;
        }

        // Check if the invoice is within the date range
        if (startDate && endDate) {
            var invoiceDate = new Date(invoice.date);
            var startRange = new Date(startDate);
            var endRange = new Date(endDate);

            // Adjusted the date range comparison to be inclusive
            isMatched = isMatched && (invoiceDate >= startRange && invoiceDate <= endRange);
        }

        return isMatched;
    });

    // Calculate the total price and count for average calculation
    var totalPrice = 0;
    var totalCount = 0;

    filteredInvoices.forEach(function (invoice) {
        totalPrice += parseFloat(invoice.price);
        totalCount += 1;
    });

    // Calculate the average price
    var averagePrice = totalCount > 0 ? totalPrice / totalCount : 0;

    // Display the average price as an alert
    alert('Average Price: $' + averagePrice.toFixed(2));
}

function clearDateRange() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    searchInvoices();
}

var deletedInvoices = []; // Array to store temporarily deleted invoices

function deleteInvoice(index) {
    var existingInvoices = JSON.parse(localStorage.getItem('flowerInvoices')) || [];
    
    // Store the invoice to be deleted temporarily
    deletedInvoices.push(existingInvoices[index]);

    // Remove the invoice at the specified index
    existingInvoices.splice(index, 1);

    // Save the updated invoices to local storage
    localStorage.setItem('flowerInvoices', JSON.stringify(existingInvoices));

    // Update the table with the modified invoices
    retrieveAndDisplayInvoices();

    // Display an undo message
    showUndoMessage();
}

function showUndoMessage() {
    var undoMessage = document.getElementById('undoMessage');
    
    // Display the undo message
    undoMessage.style.display = 'block';

    // Set a timeout to hide the undo message after a few seconds
    // setTimeout(function () {
    //     undoMessage.style.display = 'none';
    // }, 5000); // Adjust the time as needed
}

function undoDelete() {
    if (deletedInvoices.length > 0) {
        // Retrieve existing invoices
        var existingInvoices = JSON.parse(localStorage.getItem('flowerInvoices')) || [];

        // Pop the last deleted invoice from the array
        var lastDeletedInvoice = deletedInvoices.pop();

        // Add the last deleted invoice back to the list
        existingInvoices.push(lastDeletedInvoice);

        // Save the updated invoices to local storage
        localStorage.setItem('flowerInvoices', JSON.stringify(existingInvoices));

        // Update the table with the restored invoice
        retrieveAndDisplayInvoices();
    }
}

function addRowToTable(invoice) {
    var tableBody = document.getElementById('invoiceTableBody');
    var newRow = tableBody.insertRow(-1);
    var cells = [
        newRow.insertCell(0),
        newRow.insertCell(1),
        newRow.insertCell(2),
        newRow.insertCell(3),
        newRow.insertCell(4),
        newRow.insertCell(5),
        newRow.insertCell(6) // New cell for season
    ];

    cells[0].textContent = invoice.flowerName;
    cells[1].textContent = invoice.amount;
    cells[2].textContent = '$' + parseFloat(invoice.price).toFixed(2);
    cells[3].textContent = '$' + parseFloat(invoice.totalPrice).toFixed(2);
    var formattedDate = new Date(invoice.date).toLocaleDateString('en-US');
    cells[4].textContent = formattedDate;

    // Calculate and display the season
    var season = getSeason(new Date(invoice.date).getMonth() + 1); // Months are zero-based
    cells[5].textContent = season;

    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        deleteInvoice(index);
    });

    cells[6].appendChild(deleteButton);
}




