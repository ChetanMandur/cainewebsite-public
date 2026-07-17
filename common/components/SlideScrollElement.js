import Debug from "../functions/Debug.js"
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

        this.#currentSection = 0
        this.#sections = Array.from(this.getElementsByClassName("section"))
        // this.scrollHandler()


    }

    // Logic of removing event listeners when the element disconnects from DOM
    disconnectedCallback(){
        this.#debug.log("disconnect me", this.#sections)
        document.removeEventListener("wheel", this)
        document.removeEventListener("pointerdown", this)
        document.removeEventListener("keydown", this)
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
        }
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