// Apparently adding stuff to the DOM counts it as added + deleted? idk
// So on first load ima just ignore the dispatch and after that, well the gloves are off
let firstLoad = true

// Creating an event for when the DOM is changed
const domChangedEvent = new Event("DOMContentChanged")

// Creating the attributes for the Mutation Observing thing
const domChangedConfig = {
    childList: true,
    subtree: false,
}

const domChangedCallback = (list, observer) =>{
    if (!firstLoad){
        list.forEach(mutation => {
            if (mutation.removedNodes.length >0 && !firstLoad){
                document.dispatchEvent(domChangedEvent)
            }
        });
    }
    else{
        firstLoad = false
    }
}

// Creating the actual Mutation Observer and start observing
const mutationObserver = new MutationObserver(domChangedCallback)
mutationObserver.observe(document.getElementsByTagName("body")[0], domChangedConfig)