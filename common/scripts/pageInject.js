// Given a source element, find all child <script> tags and return a list of recreated script tags
    //  Essentially, this is removing <script> tags from the source and adding them to an array which is returned
        //  The new tags are not a full copy, but contain all key data
function scriptExtractor(source){
    // From source, grab all the script tags (as an array) and prepare the final return array
    const scripts = Array.from(source.getElementsByTagName("script"))
    const extractedScripts = []

    // For each of the orignal scripts
    scripts.forEach((currentScript)=>{
        // Create the new script (ie. where the current script is being copied into)
        const newScript = document.createElement("script")
        
        // Copy the inner content (in case there is data within the tag) 
        newScript.innerHTML = currentScript.innerHTML

        // For each of the attributes of the current script, copy them into the new script
        Array.from(currentScript.attributes).forEach((currentAttribute)=>{
            newScript.setAttribute(currentAttribute.name, currentAttribute.value)
        })
        
        // Add the new copy into the return array and remove the original tag from the DOM/source
        extractedScripts.push(newScript)
        currentScript.remove()

    })
    return extractedScripts
}

// Given a parent element and an array of <script> tags, append all the tags onto the parent element
function scriptAppender(parent, scripts){
    scripts.forEach((currentScript)=>{
        parent.appendChild(currentScript)
    })
    return parent
}

// Given a (file) path, fetch the HTML data, parse/process it, return processed HTML/DOM
async function pageFetch(page) {
    const pageResponse = await fetch(page)
    if (pageResponse.ok){
        // Once successful, grab response data
        const pageResult = await pageResponse.text()

        // Grab <head> and <body> from DOM
        const mainHead = document.getElementsByTagName("head")[0]
        const mainBody = document.getElementsByTagName("body")[0]
        
        // Parse and return the processed fetched HTML
        const domParser = new DOMParser()
        return domParser.parseFromString(pageResult, "text/html")
    }
}

// Given a DOM (from DOMParser) and a tag, extract the tag from the given DOM and apply it to the main DOM
function tagInjector(newDom, tag, overwrite){
    // Grab the tags from both the main (place of injection) and newDom (what will be injected)
    const mainDomTag = document.getElementsByTagName(tag)[0]
    const newDomTag = newDom.getElementsByTagName(tag)[0]

    // Extract <script> tags
    const newDomTagScripts = scriptExtractor(newDomTag)

    // // Apply the content from the fetched <head> and <body> tags into the tags in DOM
        // // Since scriptExtractor() was run on the fetched tags, .innerHTML does not contain any <script> tags
        // // Depending on if the overwrite parameter is given, replace all innerHTML of mainDomTag with the newDomTag
    if (overwrite){
        mainDomTag.innerHTML = newDomTag.innerHTML
    }
    else{
        mainDomTag.innerHTML += newDomTag.innerHTML
    }

    // // Reapply <script> tags from extraction into the main DOM
    scriptAppender(mainDomTag,newDomTagScripts)
}

/**
 * 
 * @param {Document} newDom 
 */
function headInjector(newDom){
    const currentHead = document.getElementsByTagName("head")[0]
    const incomingHead = newDom.getElementsByTagName("head")[0]

    scriptExtractor(currentHead)
    const incomingScripts = scriptExtractor(incomingHead)

    var newUniqueChildren = []

    Array.from(incomingHead.children).forEach((incomingChild)=>{
        var toAppend = true

        Array.from(currentHead.children).forEach((currentChild)=>{
            if (incomingChild.tagName == currentChild.tagName){
                switch (incomingChild.tagName){
                    case "TITLE":
                        currentChild.innerHTML = incomingChild.innerHTML
                        toAppend = false
                        break;

                    case "META":
                        if (incomingChild.isEqualNode(currentChild)){
                            toAppend = false
                        }
                        break;

                    case "LINK":
                        /**@type {string[]} */
                        const rel  = incomingChild.rel.split(" ")

                        if (rel.includes("stylesheet")){
                            if (incomingChild.isEqualNode(currentChild)){
                                toAppend = false
                            }
                        }
                        break;
                        
                    default:
                        // console.log("default", incomingChild.tagName)
                        break
                }
            }
        })

        if (toAppend){
            newUniqueChildren.push(incomingChild)
        }
    })


    newUniqueChildren.forEach((newChild)=>{
        currentHead.appendChild(newChild)
    })

    scriptAppender(currentHead,incomingScripts)

}

/**
 * 
 * @param {Element} element1 
 * @param {Element} element2 
 * @returns 
 */
function deepCompare(element1, element2){
    // console.log("COMPARING", element1, element2)

    if (element1.tagName != element2.tagName){
        // console.log("TAG NAME NOT THE SAME", element1.tagName, element2.tagName)
        return false
    }


    // console.log("Attributes:",element1.attributes, element2.attributes)

    if (element1.attributes.class.value != element2.attributes.class.value){return false}
    switch(element1.tagName){
        case("VIDEO"):
            if (
                element1.attributes.src.value != element2.attributes.src.value
            ){return false}
            break
        
        default: break
    }

    if (element1.textContent != element2.textContent){
        // console.log("MISSING TEXT CONTEXT", element1.textContent, element2.textContent)
        return false
    }

    const element1Children = Array.from(element1.children)
    const element2Children = Array.from(element2.children)

    if (element1Children.length != element2Children.length){
        // console.log("CHILDREN LENGTH NOT THE SAME", element1Children.length, element2Children.length)
        return false
    }

    for (var i=0; i< element1Children.length; i++){
        // console.log("RUNNING DEEP COMPARE ON CHILDREN:")
        if ((deepCompare(element1Children[i], element2Children[i])) == false){
            return false
        }
    }

    // console.log("THEY ARE THE SAME", element1, element2)
    return true
}


/**
 * 
 * @param {Document} newDom 
 */
function bodyInjector(newDom){
    const currentBody = document.getElementsByTagName("body")[0]
    const incomingBody = newDom.getElementsByTagName("body")[0]

    const currentSectionsContainer = currentBody.getElementsByClassName("sections-container")[0]
    const incomingSectionsContainer = incomingBody.getElementsByClassName("sections-container")[0]

    const currentOverlay = currentBody.getElementsByClassName("overlay")[0]
    const incomingOverlay = incomingBody.getElementsByClassName("overlay")[0]

    const currentScripts = scriptExtractor(currentBody)    
    const incomingScripts = scriptExtractor(incomingBody)

    const newSections = document.createElement("div")
    newSections.className = "sections-container"


    var incomingSections = []
    var currentSections = []
    if (incomingSectionsContainer != undefined){
        incomingSections = Array.from(incomingSectionsContainer.children)
    }

    if (currentSectionsContainer != undefined){
        currentSections = Array.from(currentSectionsContainer.children)
    }

    incomingSections.forEach((incoming)=>{
        let dupeFound = false
        currentSections.forEach((current)=>{
            if (deepCompare(incoming, current)){
                dupeFound = true
                newSections.appendChild(current)
            }
        })

        if (!dupeFound){
            newSections.appendChild(incoming)
        }
    })

    if (currentSectionsContainer == undefined){
        currentBody.appendChild(newSections)
    }
    else{
        currentSectionsContainer.replaceWith(newSections)
    }

    if (currentOverlay == undefined){
        if (incomingOverlay != undefined){
            currentBody.appendChild(incomingOverlay)
        }
    }
    else{
        if (incomingOverlay != undefined){
            currentBody.appendChild(incomingOverlay)
        }
        else{
            currentOverlay.remove()
        }
    }
    
    scriptAppender(currentBody,incomingScripts)

}

async function pageInject(page, overwriteHead, overwriteBody){
    const pageDom = await pageFetch(page)
    headInjector(pageDom)

    bodyInjector(pageDom)

    // tagInjector(pageDom, "head",overwriteHead)
    // tagInjector(pageDom, "body",overwriteBody)
}

export default pageInject