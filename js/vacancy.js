document.addEventListener('DOMContentLoaded', fetchRecentVacancies);

document.getElementById("vacancy-form").addEventListener("submit", fetchSearchVacancies);

async function fetchRecentVacancies() {
    const url = "https://api.lmiforall.org.uk/api/v1/vacancies/search?limit=10";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      let json = await response.json();

    //   get top 10 vacancies only - have to do manually due to API limit parameter not functioning properly.
      json = json.slice(0, 10);

      console.log(json);

      displayResults(json, "on-page-load");

    } catch (error) {
      console.error(error.message);
    }
}

async function fetchSearchVacancies(evt){

    evt.preventDefault(); // Prevent form from submitting

    document.getElementById("search-loading-container").hidden=false;

    // reset the HTML in preparation for new results.
    document.getElementById("vacancy_search_results").innerHTML="";

    // Get user inputs
    const keywords = document.getElementById("job_keywords").value;
    const location = document.getElementById("job_location").value;
    const radius = document.getElementById("job_radius").value;

    // Get search results container
    const container = document.getElementById("search_results_container");
    container.querySelector("h3").innerText = `Results for: ${keywords}`;
    container.hidden= false;

    // Prepare API link for fetching, depending on which form values have been filled
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


    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      let json = await response.json();

    //   get top 10 vacancies only - have to do manually due to API limit parameter not functioning properly.
      json = json.slice(0, 10);

      displayResults(json, "form-submit");

    } catch (error) {
      console.error(error.message);
    }
}

async function fetchGeneralInfo(vacancyTitle){

    const url = `http://api.lmiforall.org.uk/api/v1/soc/search?q=${encodeURIComponent(vacancyTitle)}`;

    try {
        const response = await fetch(url);

        if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

        let json = await response.json();

        if (!json || json.length === 0) {
            console.warn(`No general info found for "${vacancyTitle}"`);
            return {
                title: 'Unavailable',
                description: `There is no general info available regarding ${vacancyTitle}. For more information on the role please contact the company directly.`,
                tasks: 'Unavailable'
            };
        }

        console.log(url);
        console.log(json[0]);

        return json[0];
        
    } catch (error) {
        console.error(error.message);
    }
}

async function displayResults(json, displayType){

    const vacancyPromise = json.map(async vacancy => {

        const generalInfo = await fetchGeneralInfo(vacancy.title);

        const resultDiv = document.createElement("div");

        if(displayType === "on-page-load"){
            resultDiv.classList = "accordion-item my-3 py-2 border shadow-sm";
        }

        if(displayType === "form-submit"){
            resultDiv.classList = "accordion-item my-3 py-2 border shadow";
        }

        resultDiv.innerHTML = `
        <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${vacancy.id}" aria-expanded="true" aria-controls="collapse${vacancy.id}">
                <h6>${vacancy.title}</h6>
            </button>
        </h2>
        <article id="collapse${vacancy.id}" class="accordion-collapse collapse" data-bs-parent="#accordion${vacancy.id}">
            <div class="accordion-body p-4 pt-3">
                <section class="d-block border-bottom pb-3">
                    <strong>${vacancy.company}</strong><br>
                    <small class="d-block pb-2">Location: ${vacancy.location.location}</small>
                    <a class="btn btn-dark text-light bg-darkblue" href="${vacancy.link}">Apply Now</a>
                </section>
                <section class="py-3">
                    <h4>Summary</h4>
                    <p>${vacancy.summary}</p>
                    <a class="btn btn-dark text-light bg-darkblue" href="${vacancy.link}">Apply Now</a>
                </section>

                <section class="border-top">
                    <h5 class="py-2">General Information</h5>
                    <h6>${generalInfo.title}</h6>
                    <p>${generalInfo.description}</p>
                    <h6>Tasks:</h6>
                    <p>${generalInfo.tasks}</p>
                </section>
            </div>
        </article>
        `;
        
        return resultDiv;
    });

    // Wait for all promises to resolve (i.e., render all vacancies)
    const vacancyElements = await Promise.all(vacancyPromise);

    // Append all the rendered elements to the DOM at once
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