import Debug from "../functions/Debug.js"
import pageInject from "../scripts/pageInject.js";
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

class SlideScrollElement extends HTMLElement{
    static observedAttributes = ["id", "debug"]
    //// Attributes
    /**OPTIONAL PARAMETER: 
     * Used for debugging, to display where the debug log came from
     *  @type {string} 
    */
    #id = undefined

    /**
     * Debug logger for the class
     * @type {Debug}
     */
    #debug = undefined


    //// Private Variables
    /**
     * List of all the child `sections` for this element
     * @type {HTMLDivElement[]} */
    #sections = undefined

    /**
     * The current `section` the element/user is at
     * @type {number} */
    #currentSection = 0 

    /**
     * The object structure for Scroll Cases
     * 
     * @typedef {{number:{"top":(number|string)[], "center":(number|string)[], "bottom":(number|string)[], "function":()=>{}, "goTo": number }}} ScrollCases 
     * */

    /**
     * Determines where each `section` should be at a specific `index` 
     * Used in tandem with `#currentSection`
     * @type {ScrollCases} */
    #scrollCases = {}

    constructor(){
        super()
    }

    // Logic of getting `sections`
        // This is because the `section` children can be dynmaically added using `pageInject`
        // Because of this, we need to assign the variable at element connection in the DOM, alongside the new children
        // This rational can be applied to the other variable assignments
    // Assigns `#id` and `#debug` from the attributes
    // Adds the event listeners
    connectedCallback(){
        this.#id = this.getAttribute("id")
        this.#debug = new Debug(this.getAttribute("debug") == undefined ? false : true, this.#id == undefined ? "slide-scroll" : ("slide-scroll: "+ this.#id))

        document.addEventListener("wheel", this)
        document.addEventListener("pointerdown",this)
        document.addEventListener("keydown", this)
        window.addEventListener("popstate", this)

        this.#currentSection = 0
        this.#sections = Array.from(this.getElementsByClassName("section"))
        this.#debug.log("Hello from SlideScroll", this.#id+"."+" We currently have", this.#sections)
        // this.scrollHandler()


    }

    // Logic of removing event listeners when the element disconnects from DOM
    disconnectedCallback(){
        this.#debug.log("Goodbye from SlideScroll", this.#id + "." +" Gone with me are", this.#sections)
        document.removeEventListener("wheel", this)
        document.removeEventListener("pointerdown", this)
        document.removeEventListener("keydown", this)
        window.removeEventListener("popstate", this)

        // Since the 'pointerdown' event creates some other event listeners, we need to also destroy them
        // I can use an `AbortController` and do `{signal: controller.signal}`
        // But instead, I choose to just destroy
        // Not because it's better, but because I am no better
        // Consider this function redefinition as grace, as I was originally going to set the function as `undefined` or `null`
        // but I hated seeing the error in the log
        // So, goodbye functions. Goodbye element. Enjoy the garbage collecter when it gets to you
        this.scrollHandler = ()=>{
            this.#debug.log(
                '"I am dead, you have kill me. I may still speak, but my powers are stripped. If this is grace, then pity must be hell"'
            )
        }
    }

    /**
     * Sets the element's `#scrollCases` variable 
     * 
     * This is the function approach to manipulating the variable
     *  @param {ScrollCases} newCases */ 
    setScrollCases(newCases){
        this.#debug.log("Set Scroll Cases (using function)")
        this.#scrollCases = newCases

        this.#currentSection = 0
        this.#sections = Array.from(this.getElementsByClassName("section"))
        this.scrollHandler()

        document.dispatchEvent((new Event("ScrollCasesSet")))
    }

    /**
     * Sets the element's `#scrollCases` variable 
     * 
     * This is the setter approach to manipulating the variable
     *  @param {ScrollCases} newCases */ 
    set scrollCases(newCases){
        this.#debug.log("Set Scroll Cases (using setter)")
        this.#scrollCases = newCases

        this.#currentSection = 0
        this.#sections = Array.from(this.getElementsByClassName("section"))
        this.scrollHandler()

        document.dispatchEvent((new Event("ScrollCasesSet")))
    }

    // -----------------------------------------------------------------
    //// SECTION MANIPULATION ////

    /**
     * Used to send a specific `section` to a specific part of the website
     * 
     * Done by manipulating the `section`'s `top` style property
     * @param {"TOP"|"CENTER"|"BOTTOM"} location - Location where the `section` is sent
     * @param {number} index - The specific `section`
     */
    #toTheLocation(location, index){
        switch (location) {
            case "TOP":
                this.#sections[index].style.top="-100%"
                break;
            case "CENTER":
                this.#sections[index].style.top="0%"
                break;
            case "BOTTOM":
                this.#sections[index].style.top="100%"
                break;
            default:
                break;
        }
    }

    /**
     * Used to determine whether to send a specific `section` or an operation of `section`s to a `location
     * 
     * When `index` is a `number` value, this means that a specifc `section` is targetted
     * 
     * When `index` is a `string` value, this means that an operation is provided to specify which `section`'s to target
     * - `{number}+`: Target all `section`'s from {number} to the end of the `sections` list
     * @param {"TOP"|"CENTER"|"BOTTOM"} location  Location where the `section`('s) are sent
     * @param {string|number} index  Specifies which `section`('s) to target
     */
    #scrollHandlerHelper(location, index){
        this.#debug.log(location, index)
        
        if (typeof(index)=="number"){
            this.#toTheLocation(location, index)
        }
        else if (typeof(index)=="string"){
            if (index[index.length-1] == "+"){
                const number = Number(index.replaceAll("+",""))

                for (var i=number; i< this.#sections.length; i++){
                    this.#toTheLocation(location, i)
                }
            }
        }
    }

    /**
     * Updates `section` positoning in `sections` to either the locations listed in `#scrollCases` or to the default cases
     * 
     * Uses `#currentSection` to determine positioning
     * 
     * If `forcedSection` parameter is given, then `#currentSection` is updated to it's value before positioning is changed
     * 
     * If `#scrolllCases` is undefined, or `#currentSection` is not found within it, uses default positoning:
     *  - Sections between start and `#currentSection` are sent to the top
     *  - `#currentSection` is sent to the center
     *  - Sections between `#currentSection` and the end are sent to the bottom
     * @param {number} forcedSection  Updates `#currentSection` to this value before positioning is determined
     */
    scrollHandler(forcedSection){
        // If `forcedSection` is found, then `#currentSection` is updated to the value
        if (forcedSection != undefined){
            this.#debug.log("FORCING CURRENT SECTION TO:", forcedSection)
            this.#currentSection = forcedSection
        }
        this.#debug.log(this.#currentSection, this.#scrollCases)

        // Checks if `#currentSection` is found within `#scrollCases`
        if (this.#currentSection in this.#scrollCases){

            // If found, grab the value of the `case`
            const cases = this.#scrollCases[this.#currentSection]

            // If the `currentSection` has a function to run, run it
            if ("function" in cases){
                cases["function"]()
            }

            // If `goTo` is found within the case, ignore all other positioning commands/values
            // When given, re-calls `scrollHandler()` with `forcedSection` set to the `goTo` value
                // Essentially, this just forces a section to go to a different `currentSection` 
            if ("goTo" in cases){
                this.#debug.log("`goTo` ENACTED. GOING TO SECTION", cases["goTo"])
                this.scrollHandler(cases["goTo"])
            }

            // If `goTo` is not found, begin going through the paces to moving the sections into position
                // Checks if positioning command is present (top, center, bottom)
                // If present, iterate through all values in command and send it to `#scrollHandlerHelper` 
            else{
                if ("top" in cases){
                    for (var index of cases["top"]){
                        this.#scrollHandlerHelper("TOP", index)
                    }
                }
                if ("center" in cases){
                    for (var index of cases["center"]){
                        this.#scrollHandlerHelper("CENTER", index)
                    }
                }
                if ("bottom" in cases){
                    for (var index of cases["bottom"]){
                        this.#scrollHandlerHelper("BOTTOM", index)
                    }
                }
                this.#debug.log("------")
            }
        }

        // If `#currentSection` is not found within `#scrollCases`, assume default positioning
        else{

            // Send sections before `#currentSection` to the top
            for (var i=0; i < this.#currentSection; i++){
                this.#scrollHandlerHelper("TOP", i)
            }

            // Send `#currentSection` to the center
            this.#scrollHandlerHelper("CENTER", this.#currentSection)

            // Send all the sections after `#currentSection` to the bottom
            for (var i=this.#currentSection+1; i < this.#sections.length; i++){
                this.#scrollHandlerHelper("BOTTOM", i)
            }
            this.#debug.log("------")
        }
    }

    // -----------------------------------------------------------------
    //// SCROLL HELPERS ////

    /**
     * Used for handling 'scroll up'
     * Ie. Used for decreasing `#currentSection` to go to a smaller value 
     */
    #scrollUp(){
        if (this.#currentSection >0){
            this.#currentSection--
        }
        this.scrollHandler()
    }

    
    /**
     * Used for handling 'scroll down'
     * Ie. Used for increasing `#currentSection` to go to a bigger value 
     */
    #scrollDown(){
        if (this.#currentSection < this.#sections.length-1){
            this.#currentSection++
        }
        this.scrollHandler()
    }

    // -----------------------------------------------------------------
    //// SCROLL EVENT DEFINITIONS ////

    /**
     * Function to catch event listeners
     * Allows for easier management of `this` binding and defintions
     * @param {Event} event
    */
    handleEvent(event){
        switch (event.type) {
            case "wheel":
                this.#scrollWheelEvent(event)
                break;

            case "pointerdown":
                this.#scrollPointerDownEvent(event)
                break;

            case "keydown":
                this.#scrollKeyDownEvent(event)
                break;
            case "popstate":
                this.#popstateEvent(event)
                break
        }
    }

    /**
     * Popstate event (ie. when the user traverses the history stack)
     * 
     * Since this is a SPA, there is no traditional 'history stack', so we need to handle it ourselves
     * 
     * `pageInject` already handles creating a history stack when the proper parameters are given, it is up to the elements/pages to handle stack traversal
     * 
     * In this case, it is up to the `<slide-scroll>` element to properly traverse back to the proper section
     * @param {PopStateEvent} event 
     */
    #popstateEvent(event){
        // Initiate a `pageInject` once a history stack traversal is initated
            // TBH this part would make more sense in `pageInject` (or anywhere else, since this part is universal with all stack traversal calls)
                // But after a quick test of moving the logic into `pageInject`, things were breaking
                    // For future me (or anyone), I think the right call is to:
                        // - Remove the `{once:true}` for `PageInjected` event (maybe `ScrollCasesSetEvent` too idk)
                        // - Add an `AbortController` in place (since we want the event to die eventually, ideally after a successful event call)
                        // - For `PageInjected`, MAKE SURE `.before` IS SET TO `false` BEFORE CONTINUING
                            // - Right now, it just so happens to be `false` due to timing, so we blessed
                                // - Another reason why this is held together by duct tape
        this.#debug.log("Popstate | Event occured! State object:", event.state)
        pageInject(event.state.page)

        // Check for `PageInjected` event to know when the page has been injected with the stack data
        document.addEventListener("PageInjected",(pageInjectedEvent)=>{
            this.#debug.log("Popstate | PageInjected | Event occured! With `before` value:", pageInjectedEvent.before)
            while (document.readyState == "loading"){
                this.#debug.log("Popstate | PageInjected | Page is loading...")
            }
            // Once the page is loaded and ready
            if (document.readyState == "complete"){
                this.#debug.log("Popstate | PageInjected | Page completed loading!")

                // Check when the page has successfully loaded its scroll cases
                document.addEventListener("ScrollCasesSet", (ScrollCasesSetEvent)=>{
                    this.#debug.log("Popstate | PageInjected | ScrollCasesSet | Event occured!")

                    const slideScroll = document.getElementsByTagName("slide-scroll")[0]
                    const sections = Array.from(slideScroll.getElementsByClassName("section"))

                    // Set transitions to `0s` so that the page/section is travelled to without any delay
                    this.#debug.log("Popstate | PageInjected | ScrollCasesSet | Event is setting all section transitions to `0s`")
                    sections.forEach((section)=>{
                        section.style.transition = "0s"

                    })
                
                    // Travel to section as defined in history stack
                    this.#debug.log("Popstate | PageInjected | ScrollCasesSet | Event is setting the current pages `#currentSection` (with `scrollHandler()`) to:", event.state.section)
                    slideScroll.scrollHandler(event.state.section)

                    // Set transitons back to default values so scroll (and other) animations work as expected
                        // I put in a `0.1s` timeout since I am tryna beat a race condition and instead of making a proper implementation with events, I'm moving like my ancestors and just YOLO'ing to beat race conditions
                    setTimeout(()=>{
                        this.#debug.log("Popstate | PageInjected | ScrollCasesSet | Event is setting all section transitions back to it default value")
                        sections.forEach((section)=>{
                            section.style.transition = null
                        })
                    },10)
                    
                }, {once:true})
            }
        }, {once:true})
    }
    

    /**Private variable used within `#scrollWhellEvent()` @type {number} */
    #scrolledDate = 0
    
    /**Event called during the `wheel` event @param {WheelEvent} event `WheelEvent`  */
    #scrollWheelEvent (event){
        // Grabs current date
        const date = new Date().getTime()

        // Checks current date and checks the time passed (in milliseconds) since last successful scroll
        if ((date - this.#scrolledDate) > 500){
            // Checks whether is was a scroll up or down
            if (event.deltaY > 0){
                this.#scrollDown()
            }
            else if (event.deltaY < 0){
                this.#scrollUp()
            }
            // 
            this.#scrolledDate = new Date().getTime()
        }
    }

    /**
     * Click and Drag Event (For mobile devices)
     * @param {PointerEvent} event  */
    #scrollPointerDownEvent(event){
        if ((event.pointerType=="mouse" && event.button == 0) || (event.pointerType == "touch") || (event.pointerType == "pen")){
            event.preventDefault()
            // Grabs current pointer position
            var pointerDownPosition = event.offsetY
            // Defines new variable to measure pointer displacement from current position
            var pointerMovePosition = 0

            // Defines + sets new `pointermove` event handler to handle updating `pointerMovePosition`
            function pointerMove (event) {
                event.preventDefault()

                pointerMovePosition = event.offsetY - pointerDownPosition
            }
            document.addEventListener("pointermove", pointerMove)

            // Defines + sets one-off `pointerup` event handler to handle checking if the pointer moved from it's original position
            document.addEventListener("pointerup", (event)=>{
                event.preventDefault()

                // If the displacement is negative, register as a scroll up
                if (pointerMovePosition > 0){
                    this.#scrollUp()	

                }

                // If the displacement is postive, register as a scroll down
                else if (pointerMovePosition < 0){
                    this.#scrollDown()

                }

                // Remove the event listener for `pointermove` as it is no longer needed
                document.removeEventListener("pointermove", pointerMove)
            },{once:true})
        }
        
    }

    /**
     * Key Down Event (For keyboard based scrolling)
     * @param {KeyboardEvent} event  */
    #scrollKeyDownEvent(event){
        // Defines what is considered `up` and `down`
        const upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
        const downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

        // If `up` and/or `down` were pressed, scroll in the respective direction
        if (upPressed){
            this.#scrollUp()
        }
        if (downPressed){
            this.#scrollDown()
        }
    }


}

customElements.define("slide-scroll", SlideScrollElement)