import Debug from "../functions/Debug.js"

const debug = {
    scriptExtractor: new Debug (false, "PageInject-ScriptExtractor"),
    scriptAppender: new Debug (false, "PageInject-ScriptAppender"),
    pageFetch: new Debug (false, "PageInject-PageFetch"),
    tagInjector: new Debug (false, "PageInject-TagInjector"),
    headInjector: new Debug (false, "PageInject-HeadInjector"),
    deepCompare: new Debug (true, "PageInject-DeepCompare"),
    bodyInjector: new Debug (false, "PageInject-BodyInjector"),
    pageInject : new Debug (false, "PageInject-PageInject"),
}

/**
 * 
 * Event that is dispatched before and after `pageInject`
 * 
 * Event name to listen for is `PageInjected`
 */
class PageInjectedEvent extends Event{
    /**@type {boolean} */
    #before
    
    /**@type {Debug} */
    #debug

    /**
     * Need to define whether the event is dispatched before or after `pageInject` 
     * @param {boolean} before 
     */
    constructor(before){
        super("PageInjected")
        this.#before = before
        this.#debug = new Debug (false, "PageInjectedEvent")
        this.#debug.log("CONSTRUCTED 'PageInjected' EVENT")

    }

    /** Getter function for getting the `before` value */
    get before(){
        this.#debug.log("GETTER 'before' INVOKED, RETURNING DATA:", this.#before)
        return this.#before
    }
}

/**
 * Given a source element, find all child `<script>` tags and return a list of re-created `<script>` tags
 * 
 * The re-created tags are not full copies, but rather copies containing all important/attribute data
 * @param {HTMLElement} source - Element which `<script>` tags are extracted from
 * @returns {HTMLScriptElement[]} - List of re-created tags
 */
function scriptExtractor(source){
    debug.scriptExtractor.log("Starting script extraction on:", source)

    // From source, grab all the script tags (as an array) and prepare the final return array
    const scripts = Array.from(source.getElementsByTagName("script"))
    const extractedScripts = []
    
    debug.scriptExtractor.log("Grabbed scripts:", scripts)

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
        debug.scriptExtractor.log("\t Copied", currentScript, "into", newScript)
        extractedScripts.push(newScript)
        currentScript.remove()

    })

    debug.scriptExtractor.log("Finished extracting scripts:", extractedScripts)
    return extractedScripts
}

/**
 * Given a parent element, and an array of `<script>` tags, append all tags into the parent element
 * @param {HTMLElement} parent - The element in which the tags are appended into 
 * @param {HTMLScriptElement[]} scripts - The list of `<script>` tags that are to be appended into `parent`
 * @returns {HTMLElement} - The final `parent` element, with the scripts appended
 */
function scriptAppender(parent, scripts){
    debug.scriptAppender.log("Starting script appending on:", parent, " using the scripts:", scripts)
    scripts.forEach((currentScript)=>{
        parent.appendChild(currentScript)
        debug.scriptAppender.log("\t Appended:", currentScript)
    })

    debug.scriptAppender.log("Added scripts to parent", parent)
    return parent
}


/**
 * Given a local file path to a `.HTML` file, fetch the data, parse/process it, and return the processed data as a `Document` object (ie. DOM)
 * 
 * Essentially, this turns the `.HTML` file into a workable DOM
 * @param {string} page - Local file path to a `.HTML` file 
 * @returns {Promise<Document | undefined>} - The file data as a usable DOM
 */
async function pageFetch(page) {
    debug.pageFetch.log("Starting page fetch on:", page)

    const pageResponse = await fetch(page)

    debug.pageFetch.log("Page fetch response:", pageResponse)

    if (pageResponse.ok){
        // Once successful, grab response data
        const pageResult = await pageResponse.text()
        debug.pageFetch.log("Page fetch result data:", pageResult)
        
        // Parse and return the processed fetched HTML
        const domParser = new DOMParser()
        const domDocument = domParser.parseFromString(pageResult, "text/html") 
    
        debug.pageFetch.log("Parsed DOM:", domDocument)
        return domDocument
    }
}

/**
 * OLD AND NOT CURRENTLY IN USE: Superseded by `bodyInjector()` and `headInjector()`
 * 
 * Given a DOM (ie. from `pageFetch`) and a tag name, extract the first matching tag from the DOM and merge/overwrite it into the current DOM
 * 
 * Was used to inject `<head>` and `<body>` tags from a DOM into the current DOM
 * @param {Document} newDom - DOM to extract tag from
 * @param {string} tag - Tag name to be extracted 
 * @param {boolean} overwrite - Identify whether or not to overwrite the tag in the current DOM, or simply append the tag to the current DOM's tag
 */
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
 * Given a DOM, extract the `<head>` tag and merge it into the current DOM's `<head>` tag
 * @param {Document} newDom - The DOM in which the `<head>` tag is extracted from
 */
function headInjector(newDom){
    debug.headInjector.log("Starting head injection using:", newDom)

    // Grabbing the current and new DOM's `<head>` tag
    const currentHead = document.getElementsByTagName("head")[0]
    const incomingHead = newDom.getElementsByTagName("head")[0]
    debug.headInjector.log("Head injection current head:", currentHead, "incoming head:", incomingHead)

    // Remove all custom (ie. page specific) style tags
    Array.from(currentHead.children).forEach((current)=>{
        if ((current.tagName == "STYLE")){
            debug.headInjector.log("Removing", current, "from current head")
            current.remove()
        }
    })

    // Strip the current head of its scripts
    debug.headInjector.log("Removing scripts from current head")
    const currentScripts = scriptExtractor(currentHead)

    // Grab a list of the incoming head's scripts
    debug.headInjector.log("Removing scripts from incoming head")
    const incomingScripts = scriptExtractor(incomingHead)
    

    // Set up lists of new (and unique) child elements and stylesheet (ie. unique child `<link>` tags)
    var newUniqueChildren = []
    var newUniqueStylesheetPromises = []

    // Grab the current `<body>` tag and make it invisible while `<head>` injection is taking place
    const currentBody = document.getElementsByTagName("body")[0]
    currentBody.style.display = "none"

    // Iterate through all the incoming child tags
    Array.from(incomingHead.children).forEach((incomingChild)=>{
        debug.headInjector.log("Checking incoming child:", incomingChild)
        
        // Signifies whether or not the child element is to be added to the current DOM
        var toAppend = true
        var matchFound = false

        // Iterate through all the current child tags, looking for a match with the current incoming child
        Array.from(currentHead.children).forEach((currentChild)=>{
            if (!matchFound){
                debug.headInjector.log("\t Checking current child:", currentChild)

                // Check if tag names between the two children are the same
                if (incomingChild.tagName == currentChild.tagName){
                    debug.headInjector.log("\t\t Tag names match!", incomingChild.tagName)
                    
                    // Based on the tag name, different criteria need to be met for them to be considered the 'equal'
                    // If they are considered the same, the element will not be added to the current DOM (as it would be considered a duplicate)
                    switch (incomingChild.tagName){
                        // For `<title>`, only the `innerHTML` content needs to be equal
                        case "TITLE":
                            debug.headInjector.log("\t\t Don't append")
                            currentChild.innerHTML = incomingChild.innerHTML
                            toAppend = false
                            break;

                        // Since `<meta>` tags have different purposes, depending on the purpose there are different criteria for 'equal'  
                        case "META":
                            // Grabs the `property` attribute
                            const incomingProperty = incomingChild.getAttribute("property")
                            const currentProperty = currentChild.getAttribute("property")

                            // If the `property` attribute exists for both children, and they are the same, they are `equal`
                            if ((incomingProperty == currentProperty) && (incomingProperty != null) && (currentProperty != null)){
                                debug.headInjector.log("\t\t Same 'property' value!")

                                //  Grabs the `content` attribute
                                const incomingContent = incomingChild.getAttribute("content")
                                const currentContent = currentChild.getAttribute("content")
                                
                                // Checks the `content` for each child, if they are not the same, update current child with the value of `incoming`
                                // Although this would technically make them not 'equal', in this case they are equal regardless of this value
                                if (incomingContent != currentContent){
                                    currentChild.setAttribute("content", incomingChild.getAttribute("content"))
                                }

                                debug.headInjector.log("\t\t Don't append")
                                toAppend = false
                            }

                            // If the `property` attribute doesn't exist for both children, check equality using built-in `isEqualNode` function
                            else{
                                if (incomingChild.isEqualNode(currentChild)){
                                    debug.headInjector.log("\t\t Don't append")
                                    toAppend = false
                                }
                            }

                            break;
                        
                        // Since `<link>` tags have multiple different purposes, depending on the purpose there are different criteria for 'equal'
                        case "LINK":
                            // Since the signifier of the different `<link>` purposes are based on it's `rel` tag value
                            /**@type {string[]} */
                            const incomingRel  = incomingChild.rel.split(" ")
                            /**@type {string[]} */
                            const currentRel  = currentChild.rel.split(" ")

                            // If the value includes 'stylesheet', a normal `.isEqualNode()` check will suffice
                            if (incomingRel.includes("stylesheet") && currentRel.includes("stylesheet")){
                                debug.headInjector.log("\t\t Are of type 'stylesheet'")
                                if (incomingChild.isEqualNode(currentChild)){
                                    debug.headInjector.log("\t\t Don't append")
                                    toAppend = false
                                }
                            }

                            // If the value includes 'shortcut' & 'icon' in both children
                            else if (incomingRel.includes("shortcut") && incomingRel.includes("icon")){
                                if (currentRel.includes("shortcut") && currentRel.includes("icon")){
                                    debug.headInjector.log("\t\t Are of type 'shortcut icon'")
                                    
                                    // No matter the result of the equality check, never appeand child
                                    // Instead, check equality using `.isEqualNode()` and then update `.href` accordingly
                                    if (!(incomingChild.isEqualNode(currentChild))){
                                        currentChild.href = incomingChild.href
                                    }
                                    debug.headInjector.log("\t\t Don't append")
                                    toAppend = false
                                }
                            }
                            break;
                            
                        default:
                            // The default behaviour is to use `isEqualNode()` since it is sufficient enough in nearly all cases
                            // console.log("default", incomingChild.tagName)
                            if (incomingChild.isEqualNode(currentChild)){
                                debug.headInjector.log("\t\t Don't append")
                                toAppend = false
                            }
                            break
                    }
                }
                if (toAppend == false){
                    debug.headInjector.log("\t\t Match found, no more checks")
                    matchFound = true
                }
            }

        })

        // If the incoming child never matches with a current child, add it to a list of elements to add
        if (toAppend){
            debug.headInjector.log("Appending incoming child:", incomingChild)

            newUniqueChildren.push(incomingChild)
            // If the incoming child is a `<link>` element, with a 'stylesheet' `rel`/relationship value
            if (incomingChild.tagName == "LINK"){
                const rel = incomingChild.rel.split(" ")
                if (rel.includes("stylesheet")){
                    debug.headInjector.log("Creating promise....")
                    // Create a new promise, in a list of promises, that resolves once the stylesheet has fully loaded/applied
                    newUniqueStylesheetPromises.push(
                        new Promise(
                            (resolve)=>{
                                incomingChild.onload = () =>{
                                    debug.headInjector.log("Resolving promise for:", incomingChild)
                                    resolve("loaded") //Resolve result value to look for, to indicate a successful load
                                }
                            }
                        )
                    )
                }
            }
        }
    })

    // After iterating through all the incoming children, try to resolve all the incoming stylesheet promises
    Promise.allSettled(newUniqueStylesheetPromises).then((results)=>{
        // Set a variable to distinguish if all the incoming stylesheets have successfully loaded
        var allGood = true
        // Iterate through all the promise's results
        results.forEach((result)=>{
            // If the promise's resolve result value isn't 'loaded', means the specific stylesheet didn't load successfully
            // console.log(result.value)
            if (result.value != "loaded"){
                allGood = false
            }
        })
        // If all the promises successfully resolved/ if all the stylesheets successfully loaded
        if (allGood){
            debug.headInjector.log("All promises resolved correctly!")
            // Set the current body to "block" (ie. make it visable again)
            currentBody.style.display = "block" 
        }
        // If all the promises didn't successfully resolve/ if all the stylesheets didn't load successfully
        else{
            // Do something (right now it's just a console log)
            console.log("something went wrong with the stylesheets")
        }
    })

    // Finally, for each incoming new child, append them to the current `<head>` tag
    newUniqueChildren.forEach((newChild)=>{
        debug.headInjector.log("Appending", newChild, "to current head")
        currentHead.appendChild(newChild)
    })

    scriptAppender(currentHead,incomingScripts)

    debug.headInjector.log("Finished head injection with", newDom)
}

/**
 * Given two element, do a 'deep compare' of them to evaluate equality
 * 
 * Essentially, this is just a re-implementation of `.isEqualNode()`, but re-written to allow for adjustments on the 'equality' criteria at each step
 * @param {Element} element1 - The first element to be compared
 * @param {Element} element2 - The second element to be compared
 * @returns {boolean} - Whether or not the values are determined to be equal or not
 */
function deepCompare(element1, element2){
    debug.deepCompare.log("COMPARING", element1, element2)

    //// If tag names are not equal, then elements are (obviously) not equal
    debug.deepCompare.log("\t Comparing tag names...")
    if (element1.tagName != element2.tagName){
        debug.deepCompare.log("\t\tTAG NAME NOT THE SAME", element1.tagName, element2.tagName)
        return false
    }
    debug.deepCompare.log("\t\t Tag names match!")
    
    //// Based on the tag name, do additional specific check on its equality
    debug.deepCompare.log("\t Comparing tag attributes...")
    debug.deepCompare.log("\t\t Element 1 Attributes:",element1.attributes,"\n\t\t Element 2 Attributes",element2.attributes)
    switch(element1.tagName){
        // For 'VIDEO' and 'VIDEO-CANVAS' elements, need to check if `src` attribute values are equal
        case("VIDEO"):
            if (
                element1.attributes.src.value != element2.attributes.src.value
            ){debug.deepCompare.log("\t\tSRC VALUE NOT THE SAME"); return false}
            break
        
        case ("VIDEO-CANVAS"):
            if (
                element1.attributes.src.value != element2.attributes.src.value
            ){debug.deepCompare.log("\t\tSRC VALUE NOT THE SAME");return false}
            break
        default: break
    }
    debug.deepCompare.log("\t\t Tag attributes match!")

    //// Checks on the element's 'class' value
    debug.deepCompare.log("\t Comparing class values...")
    // If they both exist
    if (element1.attributes.class != undefined && element2.attributes.class != undefined){
        // Need to check if all (but the ignored) classes are the same

        // List of classes to ignore
        const ignoredClasses = ["first-section"]

        // Grab the classes of both the elements (don't include the ignored classes)
        var element1Classes = element1.attributes.class.value.split(" ").filter((currentClass)=>{
            return !(currentClass in ignoredClasses)
        }) 
        var element2Classes = element2.attributes.class.value.split(" ").filter((currentClass)=>{
            return !(currentClass in ignoredClasses)
        }) 


        // For each of the classes in the first element
        for (const element1Class of element1Classes){
            debug.deepCompare.log("\t\t Checking if '"+ element1Class+ "' from element 1 exists in element 2")
            var matchFound = false // Indicates if a match has been found

            // For each of the classes in the second element
            for (const element2Class of element2Classes){
                // Only keep going until a match is found
                if (!matchFound){
                    // If class names are the same, it's a match
                    debug.deepCompare.log("\t\t\t Checking against: '"+ element2Class + "'")
                    if (element1Class == element2Class){
                            debug.deepCompare.log("\t\t\t\t A match was found!")
                            matchFound = true
                        }
                    }
            }
            // If all the element2 classes have been iterated through, and no match was found, that means elements are not the same
            if (matchFound = false){
                debug.deepCompare.log("\t\t\t\t No match was found!")
                debug.deepCompare.log("\t\t CLASSES DO NOT MATCH (missing class)")
                return false
            }
        }
    }
    // Checks if only one of the elements contain a 'class' value
    else if (element1.attributes.class != undefined && element2.attributes.class == undefined){
        debug.deepCompare.log("\t\t CLASSES DO NOT MATCH (element2 does not have a class attribute)")    
        return false
    }
    else if (element1.attributes.class == undefined && element2.attributes.class != undefined){
        debug.deepCompare.log("\t\t CLASSES DO NOT MATCH (element1 does not have a class attribute)")
        return false
    }

    debug.deepCompare.log("\t\t Class values match!")


    //// Checks the element's `textContext` (with leading and trailing white spaces removed)
    debug.deepCompare.log("\t Checking element's `textContext`...")
    if (element1.textContent.trim() != element2.textContent.trim()){
        debug.deepCompare.log("\t\t MISSING TEXT CONTEXT", element1.textContent, element2.textContent)
        return false
    }
    debug.deepCompare.log("\t\t `textContext` match!")

    //// Obtain a list of both element's children
    const element1Children = Array.from(element1.children)
    const element2Children = Array.from(element2.children)
    debug.deepCompare.log("\t Checking element children...")
    debug.deepCompare.log("\t\t element1 children:", element1Children)
    debug.deepCompare.log("\t\t element2 children:", element2Children)

    // If the length of children are not the same, both elements are not equal
    if (element1Children.length != element2Children.length){
        debug.deepCompare.log("\t\t\t CHILDREN LENGTHS ARE NOT THE SAME", element1Children.length, element2Children.length)
        return false
    }

    // Start recursively checking all the children
    for (var i=0; i< element1Children.length; i++){
        debug.deepCompare.log("\t\t Running Deep Compare on Children:",element1Children[i],"AND", element2Children[i])
        if ((deepCompare(element1Children[i], element2Children[i])) == false){
            debug.deepCompare.log("\t ELEMENTS "+"(" , element1 , "," , element2 , ")"+" ARE NOT THE SAME")
            return false
        }
    }

    // If everything passes, the elements are the same 
    debug.deepCompare.log("\t ELEMENTS "+"(" , element1 , "," , element2 , ")"+" ARE THE SAME")
    return true
}


/**
* Given a DOM, extract the `<body>` tag and merge it into the current DOM's `<body>` tag
 * @param {Document} newDom - The DOM in which the `<head>` tag is extracted from
 */
function bodyInjector(newDom){
    // Grab the current and incoming `<body>` tags
    const currentBody = document.getElementsByTagName("body")[0]
    const incomingBody = newDom.getElementsByTagName("body")[0]

    // Grab the children of both the tags
    const currentChildren = Array.from(currentBody.children)
    const incomingChildren = Array.from(incomingBody.children)

    // Grab the sections container for both of the tags
    const currentSectionsContainer = currentBody.getElementsByTagName("slide-scroll")[0]
    const incomingSectionsContainer = incomingBody.getElementsByTagName("slide-scroll")[0]

    // Grab the overlay container for both of the tags
    const currentOverlay = currentBody.getElementsByClassName("overlay")[0]
    const incomingOverlay = incomingBody.getElementsByClassName("overlay")[0]

    // Extract and grab the scripts for both of the tags
    const currentScripts = scriptExtractor(currentBody)    
    const incomingScripts = scriptExtractor(incomingBody)

    // Create a new sections container (this is where both of the incoming and current sections will merge into)
    const newSectionsContainer = document.createElement("slide-scroll")
    
    // If the incoming sections container exists
    if (incomingSectionsContainer != undefined){
        // Apply the attributes of the container to the new sections container
        Array.from(incomingSectionsContainer.attributes).forEach(attribute => {
            newSectionsContainer.setAttribute(attribute.name, attribute.value)
        });
    }

    // Define variables to hold the incoming and current sections
    var incomingSections = []
    var currentSections = []
    
    // If the incoming sections container exist, grab the sections
    if (incomingSectionsContainer != undefined){
        incomingSections = Array.from(incomingSectionsContainer.children)
    }

    // If the current sections container exist, grab the sections
    if (currentSectionsContainer != undefined){
        currentSections = Array.from(currentSectionsContainer.children)
    }

    // For each of the incoming sections, compare it with each of the current sections
        // Goal is to find equal sections between the incoming and current sections
    incomingSections.forEach((incoming)=>{
        let dupeFound = false 
        currentSections.forEach((current)=>{
            if (deepCompare(incoming, current)){
                // If a dupe was found, add the current version into the new merged section, `newSectionsContainer`
                    // Use this version since it has already 'loaded' into memory/the DOM
                        // Easier than reloading the element by adding the incoming version
                dupeFound = true
                newSectionsContainer.appendChild(current)
            }
        })
        // If a dupe wasn't found, append the incomnig version into the new merged section, `newSectionsContainer`
        if (!dupeFound){
            newSectionsContainer.appendChild(incoming)
        }
    })

    //// Applying `newSectionsContainer`
    // If `currentSectionsContainer` doesn't exist, simply append the new `newSectionsContainer`
    if (currentSectionsContainer == undefined){
        currentBody.appendChild(newSectionsContainer)
    }
    // If `currentSectionsContainer` exists, replace it with the `newSectionsContainer`
    else{
        currentSectionsContainer.replaceWith(newSectionsContainer)
    }

    //// Applying overlay
    // If the `currentOverlay` is undefined
    if (currentOverlay == undefined){
        // And `incomingOverlay` is defined
        if (incomingOverlay != undefined){
            // Simply append the overlay into current DOM
            currentBody.appendChild(incomingOverlay)
        }
    }
    // If `currentOverlay` is defined
    else{
        // And `incomingOverlay` is defined
        if (incomingOverlay != undefined){
            // Replace `currentOverlay` with `incomingOverlay`
            currentOverlay.replaceWith(incomingOverlay)
        }

        // If `incomingOverlay` is not defined
        else{
            // Remove `currentOverlay`
            currentOverlay.remove()
        }
    }

    // Non-scroll, overlay, script tags in the current DOM are removed from DOM
    currentChildren.forEach((current)=>{
        if ((current.tagName != "SLIDE-SCROLL") && !(current.classList.contains("overlay")) && (current.tagName != "SCRIPT") ){
            // console.log("remove current", current)
            current.remove()
        }
    })

    // Non-scroll, overlay, script tags in the incoming DOM are appended into DOM
    incomingChildren.forEach((incoming)=>{
        if ((incoming.tagName!= "SLIDE-SCROLL") && !(incoming.classList.contains("overlay")) && (incoming.tagName != "SCRIPT")){
            // console.log("add incoming", incoming)
            currentBody.appendChild(incoming)
        }
    })
    
    // Append all the scripts from the incoming DOM into the current DOM
    scriptAppender(currentBody,incomingScripts)

}

/**
 * Given a local file path to a `HTML` file, merge its contents into the current DOM
 * 
 * Works by:
 * - Fetching the local file from path
 * - Parse the fetched file with the `DOMParser` interface
 *      - This turns the file into a usable DOM object (`Document` object)
 * - The fetched + parsed DOM is then merged into the current DOM
 *      - First the `<head>` tag is merged
 *      - Then the `<body>` tag is merged
 * 
 * This is the main 'injection' function, everything else is just helper functions for this
 * @param {string} page - Local file path to the `HTML` file path
 * @param {boolean} overwriteHead - (Unused) Determined whether to merge or overwrite the `<head>` tag
 * @param {boolean} overwriteBody - (Unused) Determined whether to merge or overwrite the `<body>` tag
 */
async function pageInject(page, overwriteHead, overwriteBody){
    document.dispatchEvent((new PageInjectedEvent(true)))
    
    const pageDom = await pageFetch(page)
    headInjector(pageDom)

    bodyInjector(pageDom)
    document.dispatchEvent((new PageInjectedEvent(false)))

    // tagInjector(pageDom, "head",overwriteHead)
    // tagInjector(pageDom, "body",overwriteBody)
}

export default pageInject