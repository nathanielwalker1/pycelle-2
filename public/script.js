document.addEventListener('DOMContentLoaded', () => {
    const transactionInput = document.getElementById('transactionInput');
    const categoriesInput = document.getElementById('categoriesInput');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const results = document.getElementById('results');
    const totalSpent = document.getElementById('totalSpent');
    const categoriesList = document.getElementById('categoriesList');
    const transactionsTable = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingPercentage = document.getElementById('loadingPercentage');
    let pieChart;

    async function handleSubmit() {
        const transactions = transactionInput.value.trim();
        const categories = categoriesInput.value.split(',').map(cat => cat.trim()).filter(cat => cat);

        if (!transactions) {
            alert('Please enter your transactions.');
            return;
        }

        loadingOverlay.classList.add('visible');
        loadingOverlay.classList.remove('hidden');
        
        // Initialize progress
        let progress = 0;
        updateLoadingPercentage(progress);

        // Start simulated progress
        const progressInterval = setInterval(() => {
            progress += 1;
            if (progress <= 90) {
                updateLoadingPercentage(progress);
            }
        }, 100);

        try {
            const response = await fetch('/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactions, categories }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${errorData.error}. Details: ${errorData.details}`);
            }

            const data = await response.json();
            
            // Stop simulated progress and set to 100%
            clearInterval(progressInterval);
            updateLoadingPercentage(100);

            console.log('Parsed data:', data);
            displayResults(data);
            scrollToResults();
        } catch (error) {
            console.error('Detailed error:', error);
            let errorMessage = 'An unexpected error occurred.';
            
            try {
                if (error.response) {
                    const errorData = await error.response.json();
                    errorMessage = `Server error: ${errorData.error}. Details: ${errorData.details}`;
                    console.error('Raw AI response:', errorData.rawResponse);
                } else if (error.message) {
                    errorMessage = error.message;
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            
            alert(errorMessage);
        } finally {
            clearInterval(progressInterval);
            loadingOverlay.classList.remove('visible');
            loadingOverlay.classList.add('hidden');
        }
    }

    submitBtn.addEventListener('click', handleSubmit);

    function updateLoadingPercentage(percentage) {
        loadingPercentage.textContent = `${percentage}%`;
        console.log(`Updated loading percentage: ${percentage}%`);
    }

    clearBtn.addEventListener('click', () => {
        transactionInput.value = '';
        categoriesInput.value = '';
        results.classList.add('hidden');
        if (pieChart) {
            pieChart.destroy();
        }
    });

    function displayResults(data) {
        results.classList.remove('hidden');

        // Calculate total spent and total number of transactions
        let total = 0;
        let totalTransactions = 0;
        let categoryTotals = {};

        Object.entries(data).forEach(([category, transactions]) => {
            let categoryTotal = 0;
            transactions.forEach(transaction => {
                // Improved amount extraction logic
                const amountMatch = transaction.match(/[$€£]?(\d+(?:\.\d{1,2})?)/);
                if (amountMatch) {
                    const amount = parseFloat(amountMatch[1]);
                    if (!isNaN(amount)) {
                        total += amount;
                        categoryTotal += amount;
                    }
                }
                totalTransactions++;
            });
            categoryTotals[category] = categoryTotal;
        });

        totalSpent.innerHTML = `
            <p>Total spent: $${total.toFixed(2)}</p>
            <p>Total number of transactions: ${totalTransactions}</p>
        `;

        // Sort categories by total amount spent (highest to lowest)
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        // Display sorted categories
        categoriesList.innerHTML = Object.entries(sortedCategories)
            .map(([category, categoryTotal]) => {
                const percentage = total > 0 ? ((categoryTotal / total) * 100).toFixed(2) : 0; // Prevent division by zero
                return `<p>${category}: $${categoryTotal.toFixed(2)} (${percentage}%)</p>`;
            })
            .join('');

        // Create pie chart
        const ctx = document.getElementById('pieChart').getContext('2d');
        const categories = Object.keys(sortedCategories);
        const categoryValues = Object.values(sortedCategories);

        // Extended color palette
        const colorPalette = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#B8E994', '#D980FA',
            '#079992', '#FEA47F', '#25CCF7', '#EAB543', '#55E6C1', '#CAD3C8',
            '#58B19F', '#2C3A47', '#B33771', '#3B3B98', '#FD7272', '#9AECDB'
        ];

        const categoryColors = categories.map((_, index) => colorPalette[index % colorPalette.length]);

        if (pieChart) {
            pieChart.destroy(); // Destroy previous chart instance if it exists
        }

        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryValues,
                    backgroundColor: categoryColors,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Populate transactions table
        transactionsTable.innerHTML = ''; // This line clears the existing content, including the header

        Object.entries(data).forEach(([category, transactions]) => {
            transactions.forEach(transaction => {
                const amountMatch = transaction.match(/[$€£]?(\d+(?:\.\d{1,2})?)/);
                const amount = amountMatch ? amountMatch[0] : 'N/A';
                const description = transaction.replace(amount, '').trim();

                const row = transactionsTable.insertRow();
                row.insertCell(0).textContent = description;
                row.insertCell(1).textContent = category;
                row.insertCell(2).textContent = amount;
            });
        });
    }

    function scrollToResults() {
        const resultsElement = document.getElementById('results');
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
