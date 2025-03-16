// Common Functions
function formatINR(amount) {
    if(amount >= 10000000) return '₹' + (amount/10000000).toFixed(2) + ' Cr';
    if(amount >= 100000) return '₹' + (amount/100000).toFixed(2) + ' Lakh';
    return '₹' + amount.toLocaleString('en-IN');
}

// Tab Navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab, .tab-content').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
    });
});

// EMI Calculator
function calculateEMI() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 1200;
    const months = parseFloat(document.getElementById('loanTenure').value) * 12;

    const emi = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;

    document.getElementById('monthlyEMI').textContent = formatINR(emi);
    document.getElementById('totalPayment').textContent = formatINR(totalPayment);
    document.getElementById('totalInterest').textContent = formatINR(totalInterest);

    // Amortization Table
    let balance = amount;
    let tableHTML = '';
    for(let month = 1; month <= months; month++) {
        const interest = balance * rate;
        const principal = emi - interest;
        balance -= principal;
        tableHTML += `
            <tr>
                <td>${month}</td>
                <td>${formatINR(principal)}</td>
                <td>${formatINR(interest)}</td>
                <td>${formatINR(Math.abs(balance))}</td>
            </tr>
        `;
    }
    document.getElementById('emiBody').innerHTML = tableHTML;
}

// Investment Calculator
let investmentChart;

function toggleSIP() {
    document.getElementById('monthly').style.display = 
        document.getElementById('investmentType').value === 'sip' ? 'block' : 'none';
}

function setupInvestmentControls() {
    const syncInputs = (rangeId, inputId) => {
        const range = document.getElementById(rangeId);
        const input = document.getElementById(inputId);
        
        range.addEventListener('input', () => {
            input.value = range.value;
            calculateInvestment();
        });
        
        input.addEventListener('input', () => {
            range.value = input.value;
            calculateInvestment();
        });
    };

    syncInputs('years', 'yearsInput');
    syncInputs('returns', 'returnsInput');
}

function calculateInvestment() {
    const type = document.getElementById('investmentType').value;
    const principal = +document.getElementById('principal').value || 0;
    const monthly = +document.getElementById('monthly').value || 0;
    const years = +document.getElementById('years').value;
    const returns = +document.getElementById('returns').value / 100;

    const months = years * 12;
    const monthlyReturn = returns / 12;
    let totalInvested = principal;
    let currentValue = principal;
    const labels = [];
    const data = [];

    for(let year = 1; year <= years; year++) {
        labels.push(`Year ${year}`);
        for(let month = 1; month <= 12; month++) {
            if(type === 'sip') {
                currentValue += monthly;
                totalInvested += monthly;
            }
            currentValue *= (1 + monthlyReturn);
        }
        data.push(currentValue);
    }

    document.getElementById('investmentYears').textContent = `${years} Years`;
    document.getElementById('totalInvested').textContent = formatINR(totalInvested);
    document.getElementById('finalValue').textContent = formatINR(currentValue);

    // Update Chart
    if(investmentChart) investmentChart.destroy();
    const ctx = document.getElementById('investmentChart').getContext('2d');
    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Investment Growth',
                data: data,
                borderColor: '#27ae60',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(39, 174, 96, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `Amount: ${formatINR(context.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => formatINR(value)
                    }
                }
            }
        }
    });
}

// Salary Calculator
function calculateSalary() {
    const basic = +document.getElementById('basicSalary').value || 0;
    const gradePay = +document.getElementById('gradePay').value || 0;
    const daPercent = +document.getElementById('daPercent').value || 0;
    const hraPercent = +document.getElementById('hraPercent').value || 0;

    const da = basic * (daPercent / 100);
    const hra = basic * (hraPercent / 100);
    const total = basic + gradePay + da + hra;

    document.getElementById('basicResult').textContent = formatINR(basic);
    document.getElementById('gradeResult').textContent = formatINR(gradePay);
    document.getElementById('daResult').textContent = formatINR(da);
    document.getElementById('hraResult').textContent = formatINR(hra);
    document.getElementById('totalSalary').textContent = formatINR(total);
}

// Age Calculator
function calculateAge() {
    const dob = new Date(document.getElementById('dob').value);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    document.getElementById('ageResult').textContent = `Your age is ${age} years`;
}

// Initialize
document.querySelector('.tab.active').click();
toggleSIP();
setupInvestmentControls();
