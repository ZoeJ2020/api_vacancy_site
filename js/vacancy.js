// get recent vacancies on page load
document.addEventListener('DOMContentLoaded', loadVacancies);

// get vacancies based on form inputs when form is submitted
document.getElementById("vacancy-form").addEventListener("submit", fetchSearchVacancies);

// function to get vacancies on page load depending on URL parameters
async function loadVacancies() {
    // before loading recent vacancies, check if URL parameters exist (from takehome.html links)
    const currentDirectory = window.location;
    const urlParam = new URLSearchParams(currentDirectory.search);
    const job_param = urlParam.get("job");

    // if so, get those results before getting recent vacancies
    if (job_param != null) {
        document.getElementById("job_keywords").value = job_param;
  
        // wait until vacancy search results are complete
        await fetchSearchVacancies(new Event('submit', 
        {   
            bubbles: true, 
            cancelable: true 
        }));

        // wait before getting most recent vacancies
        setTimeout(() => {
            fetchRecentVacancies();
        }, 1700);
    } else{
        // if no URL parameters are in place, get most recent vacancies without waiting
        fetchRecentVacancies();
    }

}

// function to get 10 most recent vacancies
async function fetchRecentVacancies() {
    // get api url to fetch vacancy results
    const url = "https://api.lmiforall.org.uk/api/v1/vacancies/search?limit=10";

    // try to fetch data from the url, throwing errors if unsuccessful
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText} Response status: ${response.status}`);
      }
  
    // get top 10 vacancies only - manually due to API limit parameter not functioning properly.
      let json = await response.json();
      json = json.slice(0, 10);

    // after getting top 10 results, display results on page
      displayResults(json, "on-page-load");

    } catch (error) {
      console.error(error.message);
    }
}

// function to get vacancies based on form inputs
async function fetchSearchVacancies(evt){

    // prevent form from submitting
    evt.preventDefault();
    
    document.getElementById("search-loading-container").hidden=false;

    // reset the DOM HTML in preparation for new results.
    document.getElementById("vacancy_search_results").innerHTML="";

    // get user inputs
    const keywords = document.getElementById("job_keywords").value;
    const location = document.getElementById("job_location").value;
    const radius = document.getElementById("job_radius").value;

    // get search results container
    const container = document.getElementById("search_results_container");
    container.querySelector("h3").innerText = `Results for: ${keywords}`;
    container.hidden= false;

    // prepare api link for fetching, depending on which form values have been filled
    let url = "https://api.lmiforall.org.uk/api/v1/vacancies/search?limit=10";

    // attaches URI-encoded location value if user has entered a location
    if (location){
        url += `&location=${encodeURIComponent(location)}`;
    }

    // attaches URI-encoded radius value if user has entered a radius
    if (radius){
        url += `&radius=${encodeURIComponent(radius)}`;
    }

    // add keywords to url after all optional fields have been added
    url += `&keywords=${encodeURIComponent(keywords)}`;

    // try to fetch data from the url, throwing errors if unsuccessful
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      let json = await response.json();

    //   get top 10 vacancies only - manually due to API limit parameter not functioning properly.
      json = json.slice(0, 10);

    //   display results on page
      displayResults(json, "form-submit");

    } catch (error) {
      console.error(error.message);
    }
}

// function to get general info related to each vacancy
async function fetchGeneralInfo(vacancyTitle){
    // get api url for data based on the name of the vacancy
    const url = `https://api.lmiforall.org.uk/api/v1/soc/search?q=${encodeURIComponent(vacancyTitle)}`;

    // try to fetch data from the url, throwing errors if unsuccessful
    try {
        const response = await fetch(url);

        if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

        let json = await response.json();

        // if data is missing or unavailable, return default "not found" values
        if (!json || json.length === 0) {
            console.warn(`No general info found for "${vacancyTitle}"`);
            return {
                title: 'Unavailable',
                description: `There is no general info available regarding ${vacancyTitle}. For more information on the role please contact the company directly.`,
                tasks: 'Unavailable'
            };
        }

        // if data is found, return the first object for displaying in DOM
        return json[0];
        
    } catch (error) {
        console.error(error.message);
    }
}

// function to display search results on page
async function displayResults(json, displayType){

    // if data is missing or unavailable, return default "not found" values
    if (!json || json.length === 0) {
        const resultDiv = document.createElement("div");
        resultDiv.classList = "container text-center py-3";
        resultDiv.innerHTML = `
        <h2>No results found</h2>
        <p>Please try again with more specific keywords (e.g. "Office Assistant"), or less strict filters (e.g. a further radius).</p>
        `;

        // add div to search results container and hide loading icon
        document.getElementById("vacancy_search_results").appendChild(resultDiv);
        document.getElementById("search-loading-container").hidden=true;
        
        return;
    };

    // create elements for each vacancy and inject data into HTML
    const vacancyPromise = json.map(async vacancy => {

        // wait until general vacancy info is gathered for displaying in DOM alongside search results
        const generalInfo = await fetchGeneralInfo(vacancy.title);

        // create one div per result and change classes depending on reason for fetch (recent or form submission)
        const resultDiv = document.createElement("div");
        if(displayType === "on-page-load"){
            resultDiv.classList = "accordion-item my-3 py-2 border shadow-sm text-darkblue";
        }

        if(displayType === "form-submit"){
            resultDiv.classList = "accordion-item my-3 py-2 border shadow text-darkblue";
        }

        // get DD-MM-YYYY date from raw data in vacancy object
        const postDate = vacancy.activedate.start.slice(0, 10);
        const closeDate = vacancy.activedate.end.slice(0, 10);

        // change inner HTML of div to match current vacancy's data (and general info related, if found)
        resultDiv.innerHTML = `
        <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${vacancy.id}" aria-expanded="true" aria-controls="collapse${vacancy.id}">
                <h6 class="text-darkblue">${vacancy.title}</h6>
            </button>
        </h2>
        <article id="collapse${vacancy.id}" class="accordion-collapse collapse" data-bs-parent="#accordion${vacancy.id}">
            <div class="accordion-body p-4 pt-3">
                <section class="d-block border-bottom pb-3">
                    <small class="d-block">Posted: ${postDate}</small>
                    <small class="d-block pb-3">Closing: ${closeDate}</small>
                    <strong>${vacancy.company}</strong><br>
                    <small class="d-block pb-2">Location: ${vacancy.location.location}</small>
                    <a class="btn btn-dark text-light bg-darkblue" href="${vacancy.link}" target=”_blank”>Apply Now</a>
                </section>
                <section class="py-3">
                    <h4>Summary</h4>
                    <p class="text-dark">${vacancy.summary}</p>
                    <a class="btn btn-dark text-light bg-darkblue" href="${vacancy.link}" target=”_blank”>Apply Now</a>
                </section>

                <section class="border-top">
                    <h5 class="py-2">General Information</h5>
                    <h6>${generalInfo.title}</h6>
                    <p class="text-dark">${generalInfo.description}</p>
                    <h6>Tasks:</h6>
                    <p class="text-dark">${generalInfo.tasks}</p>
                </section>
            </div>
        </article>
        `;
        
        return resultDiv;
    });

    // wait for all vacancy items to be created
    const vacancyElements = await Promise.all(vacancyPromise);

    // add all the elements to the DOM at once, depending on reason for fetch (recent or form submission)
    if(displayType === "on-page-load"){
        let resultsContainer = document.getElementById("recent_results");
        vacancyElements.forEach(element => resultsContainer.appendChild(element));
        document.getElementById("recent-loading-container").hidden=true;
    }

    if(displayType === "form-submit"){
        const resultsContainer = document.getElementById("vacancy_search_results");
        vacancyElements.forEach(element => resultsContainer.appendChild(element));
        document.getElementById("search-loading-container").hidden=true;
    }

}