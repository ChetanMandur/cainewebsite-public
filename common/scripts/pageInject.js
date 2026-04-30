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

    var newUniqueChildren = []

    Array.from(incomingHead.children).forEach((incomingChild)=>{
        var isDupe = false
        Array.from(currentHead.children).forEach((currentChild)=>{
            if (incomingChild.tagName == currentChild.tagName){
                // console.log("wtf", incomingChild.tagName)
                switch (incomingChild.tagName){
                    case "LINK":
                        console.log("link")
                        if ((incomingChild.isEqualNode(currentChild))){
                            isDupe = true
                        }
                        break;
                    default:
                        break
                }
            }
        })

        if (!isDupe){
            newUniqueChildren.push(incomingChild)
        }
    })


    newUniqueChildren.forEach((newChild)=>{
        currentHead.appendChild(newChild)
    })
}

async function pageInject(page, overwriteHead, overwriteBody){
    const pageDom = await pageFetch(page)
    headInjector(pageDom)

    // tagInjector(pageDom, "head",overwriteHead)
    tagInjector(pageDom, "body",overwriteBody)
}

export default pageInject