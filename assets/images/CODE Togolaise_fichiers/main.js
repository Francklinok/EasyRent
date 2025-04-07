function whenScreenResized() {
    window.addEventListener("resize", adjustScreenView);
}

function adjustScreenView() {
    adjustView();

    if (isMobile()) {
        adjustForMobileView();
    } else if (isTablet()) {
        adjustForTabletView();
    } else {
        adjustForDesktopView();
    }

    adjustScreenZoom();
}

function adjustScreenZoom() {
    const zoom = localStorage.getItem('currentZoom') || '100%';
    document.body.style.zoom = zoom;
}

function adjustView() {
    var navigationAreaHeight = window.getComputedStyle(document.querySelector('#navigationArea')).height;
    document.querySelector('body').style.paddingTop = navigationAreaHeight;
}

function adjustForMobileView() {
    showAccordionInMenu();
    showAccordionInFooter();
}

function adjustForTabletView() {
    hideAccordionInMenu();
    showAccordionInFooter();
}

function adjustForDesktopView() {
    hideAccordionInMenu();
    hideAccordionInFooter();
}

function showAccordionInMenu() {
    var accordionButton = document.querySelector("a[data-bs-toggle].offcanvas-item-title");
    accordionButton.setAttribute("data-bs-toggle", "collapse");
    accordionButton.classList.add("accordion-button");
}

function hideAccordionInMenu() {
    var accordionButton = document.querySelector("a[data-bs-toggle].offcanvas-item-title");
    accordionButton.setAttribute("data-bs-toggle", false);
    accordionButton.classList.remove("accordion-button");
}

function showAccordionInFooter() {
    var accordionButtons = document.querySelectorAll("#accordionFooter span[data-bs-toggle]");
    var accordionLists = document.querySelectorAll("#accordionFooter ul");

    accordionButtons.forEach((el) => {
        el.setAttribute("data-bs-toggle", "collapse");
        el.classList.add("accordion-button");
    });

    accordionLists.forEach((ls) => ls.classList.remove("show"));
    document.querySelector("#collapseNavigation").classList.add("show");
}

function hideAccordionInFooter() {
    var accordionButtons = document.querySelectorAll("#accordionFooter span[data-bs-toggle]");
    var accordionLists = document.querySelectorAll("#accordionFooter ul");

    accordionButtons.forEach((el) => {
        el.setAttribute("data-bs-toggle", false);
        el.classList.remove("accordion-button");
        el.classList.add();
    });

    accordionLists.forEach((ls) => ls.classList.add("show"));
}

function footerCurrentYear() {
    const yearSpan = document.querySelector('.current-year');
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear;
}