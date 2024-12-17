document.getElementById("takehome-form").addEventListener("submit", calculateTakehome);

function calculateTakehome(evt) {

    evt.preventDefault(); // Prevent form from submitting

    // set output div to hidden, incase the div is already showing due to previous calculation
    document.getElementById("takehome_output").hidden = true;

    // Get user inputs
    const jobTitle = document.getElementById("job_title").value;
    const grossPay = document.getElementById("gross_pay").value;
    const payTimeframe = document.getElementById("pay_timeframe").value;
    const hours = document.getElementById("hours").value;
    const taxRate = document.getElementById("tax").value;
    const niRate = document.getElementById("ni").value;


    // get tax deduction
    const taxDeduct = grossPay * (taxRate / 100);


    // get NI deduction
    const niDeduct = grossPay * (niRate / 100);


    // base calculation - will be the basis for other timeframe calculations
    calculation = grossPay - taxDeduct - niDeduct;

    // get take home pay per year depending on pay timeframe selected
    switch (payTimeframe) {
        case "Year":
            var takehomeYear = calculation;
            break;

        case "Month":
            var takehomeYear = calculation * 12;
            break;

        case "Week":
            var takehomeYear = calculation * 52;
            break;

        case "Hour":
            var takehomeYear = calculation * 52 * hours;
            break;
    
        default:
            console.log("Error within form submission: Pay Timeframe not specified");
            break;
    }

    // get other timeframe values (monthly, weekly, hourly) by dividing yearly result

    let takehomeMonth = takehomeYear / 12;
    let takehomeWeek = takehomeYear / 52;
    let takehomeHour = takehomeWeek / hours;

    let resultObject = { 
        JobTitle: jobTitle,
        HoursWorked: hours,
        GrossPay: grossPay,
        PayTimeframe: payTimeframe,
        TaxRate: taxRate,
        NIRate: niRate,
        HourPay: takehomeHour.toFixed(2),
        WeekPay: takehomeWeek.toFixed(2),
        MonthPay: takehomeMonth.toFixed(2),
        YearPay: takehomeYear.toFixed(2)
    };

    displayResult(resultObject);

}

function displayResult(resultObject){

    const heroOutputCard = document.getElementById("takehome_output");
    heroOutputCard.hidden = true;

    heroOutputCard.innerHTML=`
        <h3>Job: <b><a class="text-darkblue" href="vacancies.html?job=${resultObject.JobTitle}">${resultObject.JobTitle}</a></b></h3>
        <p>Working <b>${resultObject.HoursWorked} hours a week</b> for a gross pay of <b>£${resultObject.GrossPay} per ${resultObject.PayTimeframe}</b> with <b>${resultObject.TaxRate}% Tax</b> and <b>${resultObject.NIRate}% NI</b> results in a take-home pay of:</p>
        <ul class="list-group list-group-flush pb-5">
            <li class="list-group-item">£${resultObject.HourPay} per Hour</li>
            <li class="list-group-item">£${resultObject.WeekPay} per Week</li>
            <li class="list-group-item">£${resultObject.MonthPay} per Month</li>
            <li class="list-group-item">£${resultObject.YearPay} per Year</li>
        </ul>
        <a href="#takehome_output_history" class="link-secondary text-darkblue">View all calculations</a>`;

    heroOutputCard.hidden = false;
    heroOutputCard.classList = "p-3 border bg-light h-100 p-0 p-5 my-lg-0 animate-fadeUpIn";

    if(window.innerWidth <= "992"){
        heroOutputCard.scrollIntoView();
    }
        

    const newDiv = document.createElement("article");
    newDiv.classList.add("col-md-6");

    newDiv.innerHTML =
        `<div class="card bg-light rounded-0 my-3">
            <div class="card-body">
                <h3>Job: <b><a class="text-darkblue" href="vacancies.html?job=${resultObject.JobTitle}">${resultObject.JobTitle}</a></b></h3>
                <p>Working <b>${resultObject.HoursWorked} hours a week</b> for a gross pay of <b>£${resultObject.GrossPay} per ${resultObject.PayTimeframe}</b> with <b>${resultObject.TaxRate}% Tax</b> and <b>${resultObject.NIRate}% NI</b> results in a take-home pay of:</p>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">£${resultObject.HourPay} per Hour</li>
                    <li class="list-group-item">£${resultObject.WeekPay} per Week</li>
                    <li class="list-group-item">£${resultObject.MonthPay} per Month</li>
                    <li class="list-group-item">£${resultObject.YearPay} per Year</li>
                </ul>
            </div>
        </div>`;

    document.getElementById("takehome_output_history").appendChild(newDiv);

}