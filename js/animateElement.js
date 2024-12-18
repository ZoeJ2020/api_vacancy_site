// JavaScript for base animation function

// function to add observer to elements and add classes to activate animations on-scroll
function animateElement(elementId, animationName){
    
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // if element is on screen and 80% visible, start animation
            if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
                entry.target.classList.add(animationName);
    
                // after animation class is added, no need to continue observing.
                observer.unobserve(entry.target);
            }
        });
    }, {
        // trigger at 80% visibility
        threshold: 0.8 
    });
    // add observer to parameter element
    observer.observe(document.getElementById(elementId));
}

// add animation observer to index elements, both desktop and mobile versions
animateElement("d-takehome-text", "animate-fadeRightIn");
animateElement("d-vacancy-text", "animate-fadeLeftIn");

animateElement("m-takehome-text", "animate-fadeRightIn");
animateElement("m-vacancy-text", "animate-fadeLeftIn");