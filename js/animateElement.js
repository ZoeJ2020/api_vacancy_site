function animateElement(elementId, animationName){
    
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If
            if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
                entry.target.classList.add(animationName);
    
                // After class is added, no need to continue observing.
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Trigger at 80% visibility of element
        threshold: 0.8 
    });
    
    observer.observe(document.getElementById(elementId));
}