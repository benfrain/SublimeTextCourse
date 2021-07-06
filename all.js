var insertNode = document.querySelector(".post-PimpingAintEasy");

// Wrapper for Blog post
var wrappingElement = document.querySelector(".post-Content");

// Get all H1/H2 tags from the post
if (wrappingElement !== null) {
    var allHtags = Array.from(
        wrappingElement.querySelectorAll(":scope > h1, :scope > h2")
    );
}
// Reveal Menu button
var menuBtn = document.querySelector(".hd-Nav_Hamburger");
menuBtn.addEventListener("pointerdown", (e) => {
    e.target.hasAttribute("aria-expanded")
        ? e.target.removeAttribute("aria-expanded")
        : e.target.setAttribute("aria-expanded", "true");
});

// Intersection Observer Options
var options = {
    root: null,
    rootMargin: "0px",
    threshold: [1],
};

// Each Intersection Observer runs setCurrent
var observeHtags = new IntersectionObserver(setCurrent, options);

// Build the DOM for the menu
function createTOC() {
    var frag = document.createDocumentFragment();
    var jsNav = document.createElement("nav");
    jsNav.classList.add("toc-Wrapper");
    var tocTitle = document.createElement("h4");
    tocTitle.classList.add("toc-Title");
    tocTitle.textContent = "Sections";
    jsNav.appendChild(tocTitle);
    allHtags.forEach((el, i) => {
        var links = document.createElement("a");
        links.setAttribute("href", "#h-" + el.tagName + "_" + i);
        links.classList.add("toc-Link");
        links.classList.add("toc-Link_" + el.tagName);
        var textContentOfLink = el.textContent;
        el.id = "h-" + el.tagName + "_" + i;
        links.textContent = textContentOfLink;
        frag.appendChild(links);
    });
    jsNav.appendChild(frag);
    insertNode.appendChild(jsNav);
    // Now
    allHtags.forEach((tag) => {
        observeHtags.observe(tag);
    });
}

function didThisIntersectionHappenAtTop(i) {
    return i.rootBounds.bottom - i.boundingClientRect.bottom >
        i.rootBounds.bottom / 2
        ? true
        : false;
}

function getHeadingIndex(i) {
    let priorEle = (ele) => ele === i.target;
    return allHtags.findIndex(priorEle);
}

// Function that runs when the Intersection Observer fires
function setCurrent(e) {
    var allSectionLinks = document.querySelectorAll(".toc-Link");
    e.map((i) => {
        let top = didThisIntersectionHappenAtTop(i);
        // Page just loaded ... probably and a heading is in view
        if (i.time < 1000 && i.isIntersecting) {
            document
                .querySelector(`a[href="#${i.target.id}"]`)
                .classList.add("current");
        } else if (i.time < 1000) {
            // In this case page just loaded and no heading in view
            return;
        } else if (!top && i.isIntersecting === false) {
            // This section deals with scrolling up the page. First we find if the heading being scrolled off the bottom is the first H tag in source order.
            let indexOfThisHeading = getHeadingIndex(i);
            if (indexOfThisHeading === 0) {
                // The first H tag just scrolled off the bottom of the viewport and it is the first H tag in source order
                allSectionLinks.forEach((link) =>
                    link.classList.remove("current")
                );
            } else {
                // An H tag scrolled off the bottom. It isn't the first so make the previous heading current
                allSectionLinks.forEach((link) =>
                    link.classList.remove("current")
                );
                document
                    .querySelector(
                        `a[href="#${allHtags[indexOfThisHeading - 1].id}"]`
                    )
                    .classList.add("current");
            }
        } else if (i.isIntersecting) {
            // For all other instances we want to make this one current and the others not current
            allSectionLinks.forEach((link) => link.classList.remove("current"));
            document
                .querySelector(`a[href="#${i.target.id}"]`)
                .classList.add("current");
        }
    });
}

(function setUp() {
    if (wrappingElement === null) {
        return;
    }
    createTOC();
})();
