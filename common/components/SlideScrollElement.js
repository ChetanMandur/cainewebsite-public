import Debug from "../functions/Debug.js"
class SlideScrollElement extends HTMLElement{
    static observedAttributes = ["id", "debug"]

    /**@type {string} */
    #id = undefined

    /**@type {Debug} */
    #debug = undefined

    /**@type {ShadowRoot} */
    #shadow = undefined

    /**@type {HTMLDivElement[]} */
    #sections = undefined

    /**@type {number} */
    #currentSection = 0 

    /**@typedef {{number:{"top":(number|string)[], "center":(number|string)[], "bottom":(number|string)[], "function":()=>{}, "goTo": number }}} ScrollCases */

    /**@type {ScrollCases} */
    #scrollCases = {}

    constructor(){
        super()
    }

    connectedCallback(){
        this.#id = this.getAttribute("id")
        this.#debug = new Debug(this.getAttribute("debug") == undefined ? false : true, this.#id == undefined ? "slide-scroll" : ("slide-scroll: "+ this.#id))

        document.addEventListener("wheel", this)
        document.addEventListener("pointerdown",this)
        document.addEventListener("keydown", this)

        this.#currentSection = 0
        this.#sections = Array.from(this.getElementsByClassName("section"))
        // this.#scrollHandler()


    }

    disconnectedCallback(){
        this.#debug.log("disconnect me", this.#sections)
        document.removeEventListener("wheel", this)
        document.removeEventListener("pointerdown", this)
        document.removeEventListener("keydown", this)
    }

    /** @param {ScrollCases} newCases */ 
    setScrollCases(newCases){
        this.#debug.log("Set Scroll Cases")
        this.#scrollCases = newCases

        this.#currentSection = 0
        this.#sections = Array.from(this.getElementsByClassName("section"))
        this.#scrollHandler()
    }

    // -----------------------------------------------------------------
    //// SECTION MANIPULATION ////

    /**
     * 
     * @param {"TOP"|"CENTER"|"BOTTOM"} location 
     * @param {string|number} index 
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
     * 
     * @param {"TOP"|"CENTER"|"BOTTOM"} location 
     * @param {string|number} index 
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

    #scrollHandler(){
        this.#debug.log(this.#currentSection, this.#scrollCases)
        if (this.#currentSection in this.#scrollCases){
            const cases = this.#scrollCases[this.#currentSection]

            if ("goTo" in cases){
                this.#debug.log("`goTo` ENACTED. GOING TO SECTION", cases["goTo"])
                this.#currentSection = cases["goTo"]
                this.#scrollHandler()
            }
            else{
                if ("function" in cases){
                    cases["function"]()
                }
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
        else{
            for (var i=0; i < this.#currentSection; i++){
                this.#scrollHandlerHelper("TOP", i)
            }

            this.#scrollHandlerHelper("CENTER", this.#currentSection)

            for (var i=this.#currentSection+1; i < this.#sections.length; i++){
                this.#scrollHandlerHelper("BOTTOM", i)
            }
            this.#debug.log("------")
        }
    }

    // -----------------------------------------------------------------
    //// Helper functions used when scrolling
    ////    - Used to limit manipulation on the currentSection value, so it won't go out of range
    
    #scrollUp(){
        if (this.#currentSection >0){
            this.#currentSection--
        }
        this.#scrollHandler()
    }

    #scrollDown(){
        if (this.#currentSection < this.#sections.length-1){
            this.#currentSection++
        }
        this.#scrollHandler()
    }

    //// SCROLL EVENT DEFINITIONS ////
    /**@param {number} event  */
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
    
    // Scroll Wheel Event (Throttle function)
    /**@type {number} */
    #scrolledDate = 0

    /**@param {WheelEvent} event  */
    #scrollWheelEvent (event){
        const date = new Date().getTime()
        if ((date - this.#scrolledDate) > 500){
            if (event.deltaY > 0){
                this.#scrollDown()
            }
            else if (event.deltaY < 0){
                this.#scrollUp()
            }
            this.#scrolledDate = new Date().getTime()
        }
    }

    // Click and Drag Event (For mobile devices)
    /**@param {PointerEvent} event  */
    #scrollPointerDownEvent(event){
        event.preventDefault()
        var pointerDownPosition = event.offsetY
        var pointerMovePosition = 0


        function pointerMove (event) {
            event.preventDefault()

            pointerMovePosition = event.offsetY - pointerDownPosition
        }
        document.addEventListener("pointermove", pointerMove)

        document.addEventListener("pointerup", (event)=>{
            event.preventDefault()
            if (pointerMovePosition > 0){
                this.#scrollUp()	

            }
            else if (pointerMovePosition < 0){
                this.#scrollDown()

            }

            document.removeEventListener("pointermove", pointerMove)
        },{once:true})
    }

    // Key Down Event (For keyboard based scrolling)
    /**@param {KeyboardEvent} event  */
    #scrollKeyDownEvent(event){
        const upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
        const downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

        if (upPressed){
            this.#scrollUp()
        }
        else if (downPressed){
            this.#scrollDown()
        }
    }


}

customElements.define("slide-scroll", SlideScrollElement)