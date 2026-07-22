import Debug from "../functions/Debug.js"

/**
 * Event that is fired when the timer countdown is completed and user clicks completion text (default value is `ENTER`)
 * Event name to listen for is `TiemrEntered`
 */
class TimerEnteredEvent extends Event {
    /**Exposes the source timer element for the end user (aka us aka me aka im going crazy) @type {TimerElement} */
    #timerElement = undefined

    /**Need to define the source element to construct the event @param {TimerElement} sourceTimerElement */
    constructor(sourceTimerElement){
        super("TimerEntered")

        this.#timerElement = sourceTimerElement
    }

    // Getter function to access the source timer element
    get timer(){
        return this.#timerElement
    }

    // Getter function to access the result (an abstraction of grabbing the result directly from the element)
    get result(){
        return this.#timerElement.getResult()
    }
}


export default class TimerElement extends HTMLElement{
    //// ATTRIBUTES DATA
    static observedAttributes = ["date", "result","delete-speed","replace-speed","replace-text", "debug"]

    /** 
     * Date value passed in through the `date` element attribute 
     * 
     * Is either in the form of:
     * - `URL` that returns an object with the properties:
     *      - `year`
     *      - `month` - (as a number, in standard JavaScript manner with 0 = January and 11 = December)
     *      - `day` - (the numeric day)
     *      - `hours`
     *      - `minutes`
     *      - `seconds`
     * - `Timer.*` (* = `TenSeconds`, `FiveSeconds`, or `ZeroSeconds`)
     * 
     * @type {string} */
    #dateAttribute = undefined

    /**
     * Result value passed in through the `result` element attribute
     * 
     * In the form of a URL
     * - The element will provide the `response` of the URL as the `result`
     *  @type {string} */
    #resultAttribute = undefined

    /**
     * Delete speed value passed in through the `delete-speed` element attribute
     * 
     * Value is used to define the speed at which each character in the `timer` (specifically the countdown) is deleted
     * 
     * Default value is `200`
     * @type {number} */
    #deleteSpeedAttribute = undefined
    
    /**
     * Replace speed value passed in through the `replace-speed` element attribute
     * 
     * Value is used to define the speed at which each character from the new text (displayed after the countdown) is placed at
     * 
     * Default value is `500`
     * @type {number} */
    #replaceSpeedAttribute = undefined

    /**
     * Replace text value passed in through the `replace-text` element attribute
     * 
     * Value is used to defined the new text that is displayed after the countdown is finished and deleted
     * 
     * Default value is `ENTER`
     * @type {string} */
    #replaceTextAttribute = undefined

    /**
     * Debug value passed in through the inclusion of the `debug` element attribute
     * 
     * Value is ignored, instead, if attribute is included the element's debug statements are enabled, allowing for debug logs to appear
     * @type {Debug} */
    #debug = undefined

    //// CLASS DATA / PRIVATE VARIABLES
    /**
     * The date object refering to the date at which the countdown is finished
     * 
     * Value is derived from `dateAttribute` (ie. the `date` element attribute)
     * 
     * See `#getDate()` on how the object is created
     * @type {Date} */
    #date = undefined

    /**
     * The response object of the result data
     * 
     * Value is derived from `#resultAttribute` (ie. the `result` element attribute)
     * 
     * See `#getResult()` on how the object is first and subsequently created/received
     * @type {Response} */
    #result = undefined

    /**
     * The event that is used to signal that the countdown timer has been clicked on post-countdown
     * @type {TimerEnterEvent} */
    #timerEvent = new TimerEnteredEvent(this)

    /**
     * A list of animation IDs that are used within the countdown element
     * 
     * Each index represents a different stage of the countdown element:
     *  - `0`: Animation used within the 'countdown` stage of the element (ie. `#countAnimation())
     *  - `1`: Animation used within the 'delete countdown' stage of the element (ie. `#deleteAnimation()`)
     *  - `2`: Animation used within the `replace countdown` stage of the element (ie. `replaceAnimation()`)
     * @type {number[]} */
    #animationIDs = [0,0,0]

    //// ELEMENT DATA
    /**
     * The Shadow DOM/root of the element
     * 
     * Used to define the local style sheet of the element    
     * @type {ShadowRoot} */
    #shadow = undefined

    /**
     * The raw HTML element refering to the timer's text element
     * 
     * Used to manipulate text of element
     * @type {HTMLHeadingElement} */
    #timer = undefined


    /**
     * Sets up element
     *  - Grabs attributes
     *  - Defines stylesheet / Sets up shadow DOM
     */
    constructor(){
        super()

        this.#dateAttribute = this.getAttribute("date")
        this.#resultAttribute = this.getAttribute("result")
        this.#deleteSpeedAttribute = Number(this.getAttribute("delete-speed") ?? 200) 
        this.#replaceSpeedAttribute = Number(this.getAttribute("replace-speed") ?? 500) 
        this.#replaceTextAttribute = this.getAttribute("replace-text") ?? "ENTER"

        this.#debug = new Debug(this.getAttribute("debug") == undefined ? false : true, "timer")

        const styleSheet = new CSSStyleSheet()
        styleSheet.replaceSync(
            `
                .timer {
                    width:fit-content;
                    height:fit-content;
                    /* font-family: 'Courier New', Courier, monospace; */
                    font-family: monospace;
                    opacity: 50%;
                    color: white;
                    background-color: black;
                }
            `
        )

        this.#shadow = this.attachShadow({mode:"open"})
        this.#shadow.adoptedStyleSheets = [styleSheet]

        this.#timer = document.createElement("h1")
        this.#timer.classList.add("timer")

        this.#shadow.appendChild(this.#timer)
    }

    /**
     * Once element is connected, obtain `Date` object and begin countdown animation
     */
    connectedCallback(){
        this.#getDate().then((date)=>{
            this.#date = date
        }).finally(()=>{
            this.#animationIDs[0] = requestAnimationFrame(()=>{this.#countAnimation()})
        })
    }

    /**
     * Obtains the `Date` object derived from `#dateAttribute`
     * @returns {Date}
     */
    async #getDate(){
        // Check which form `#dateAttribute` is in
        // If in the form of `Timer.*`, means value is a locally defined date based on current time
        if (this.#dateAttribute.slice(0,6) == "Timer."){
            // Find the value of `*` and create + return `Date` object based on its value
            switch (this.#dateAttribute.slice(6)) {
                case "FiveSeconds":
                    this.#debug.log("Using built-in date: 5 SECONDS")
                    return (new Date((new Date()).getTime() + 6000))
                    break;
                
                case "TenSeconds":
                    this.#debug.log("Using built-in date: 10 SECONDS")
                    return (new Date((new Date()).getTime() + 11000))
                    break;
                
                case "ZeroSeconds":
                    this.#debug.log("Using built-in date: 0 SECONDS")
                    return (new Date((new Date()).getTime()))
                    break;

                default:
                    console.error("DATE ATTRIBUTE ERROR")
                    break;
            }
        }
        // If in the form of `https://`, means value is (obviously) a URL whose value needs to be retrieved
        else if (this.#dateAttribute.slice(0,8) == "https://"){
            this.#debug.log("Fetching Date:",this.#dateAttribute)
            // Fetch and await response from URL
            const response = await fetch(this.#dateAttribute)

            if (response.ok){
                // Grab result data and 
                // (blindly since YOLO, we let the `Date` constructor and/or JavaScript object parsing deal with errors of missing values)
                // construct + assign + return `Date` object
                const result = await response.json()
                this.#debug.log("Date Response:",result)
                return (new Date(
                    new Date(
                        result.year, result.month, result.day, result.hours, result.minutes, result.seconds
                    ).toLocaleString(
                        "en-US", {timeZone: "America/New_York"}
                    )
                ))
            }
            else{
                console.error("DATE ATTRIBUTE ERROR")
            }
        }
        else{
            console.error("DATE ATTRIBUTE ERROR")
        }
    }

    /**
     * Obtains the `Response` object derived from `#resultAttribute`
     * @returns {Response|undefined}
     */
    async getResult(){
        // Checks if `#result` is defined (ie. checks if `#resultAttribute` has been successfully fetched before)
        if (this.#result == undefined){
            this.#debug.log("Fetching Result:",this.#resultAttribute)
            const response = await fetch(this.#resultAttribute)

            // If fetch is successful, assign the `Response` value to `#result`
            if (response.ok){
                this.#debug.log("Result Response:", response)
                this.#result = response
            }
            // If fetch is not successful, don't assign `#result` to anything and return `undefined`
            else{
                console.error("ERROR GETTING RESULT DATA!")
                return undefined
            }
        }
        else{
            this.#debug.log("Result already fetched:", this.#result)
        }
        // Once `#result` has been defined, return a 'clone` of the `Response` object
        // This is done since a `Response` object's body can only be consumed once
        // By cloning it, a single `Response` object's body can be consumed multiple times
        return (this.#result).clone()
    }

// ======================================================================================================
    /**
     * Function handling the 'countdown' animation
     * 
     * Ie. the function that shows the timer ticking down
     */
    #countAnimation(){
        // Calculate the amount of time between the 'release' date and current time (ie. the distance)
        const distance = this.#date.getTime() - (new Date().getTime());

        // Get the values for the time distance
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var milliseconds = Math.floor((distance % (1000)));

        // Place leading zeros for the units when needed
        if (days < 10){
            days = "0" + days
        }
        
        if (hours < 10){
            hours = "0" + hours
        }
        if (minutes < 10){
            minutes = "0" + minutes
        }
        if (seconds < 10){
            seconds = "0" + seconds
        }

        if (milliseconds < 10){
            milliseconds = "0"+ "0" + milliseconds
        }
        else if (milliseconds < 100){
            milliseconds = "0" + milliseconds
        }

        // Finally, place the distance time values as a `string` into the `timer` element
        this.#timer.textContent = days + ":" + hours + ":" + minutes + ":" + seconds + ":" + milliseconds;

        // Check if the distance is less than or equal to 0
        // If so, that means 'release' date has been either passed or finally reached
        if (distance <= 0){
            this.#debug.log("TIMER COUNTDOWN COMPLETE!", distance)
            // Helps with the race case where timer freezes on a negative number
            this.#timer.textContent = "00" + ":" + "00" + ":" + "00" + ":" + "00" + ":" + "000";

            // Cancel countdown timer
            cancelAnimationFrame(this.#animationIDs[0])

            // Begin delete countdown animation
            this.#debug.log("Beginning timer delete animation")
            this.#animationIDs[1]=requestAnimationFrame(()=>{this.#deleteAnimation(this.#timer.textContent.length, this.#deleteSpeedAttribute)})
        }
        // If the 'release' date hasn't been passed/reached
        else{
            // Animate the next frame of the countdown animation
            this.#animationIDs[0] = requestAnimationFrame(()=>{this.#countAnimation()})
        }
    }

    /**
     * Function handling the `delete` animation
     * 
     * Ie. the function that shows the completed timer/countdown being deleted
     * @param {number} timerSize - Used to keep track of the timer's text content (ie. the finished timer text) size
     * @param {number} animationSpeed - Speed at which the text is deleted
     */
    #deleteAnimation(timerSize, animationSpeed){
        // If there are still more characters to 'delete'
        if (timerSize >= 0){
            // Remove the last character in the timer's text content and update `timerSize`
            this.#timer.textContent = this.#timer.textContent.slice(0,timerSize)
            timerSize--

            // Animate the next frame of the delete animation
            setTimeout(()=>{
                this.#animationIDs[1] = requestAnimationFrame(()=>{
                        this.#deleteAnimation(timerSize,animationSpeed)
                })
            },animationSpeed)
            
        }
        // If all the characters have been 'deleted'
        else{
            this.#debug.log("TIMER DELETE COMPLETE!", timerSize)
            
            // Cancel delete animation
            cancelAnimationFrame(this.#animationIDs[1])
            this.#debug.log("Beginning timer text replace animation")

            // Being replace countdown animation 
            this.#animationIDs[2]=requestAnimationFrame(()=>{this.#replaceAnimation(this.#replaceTextAttribute,this.#replaceSpeedAttribute,0)})

        }
    }

    /**
     * Function handling the `replace` countdown animation
     * 
     * Ie. the function that shows the new text being written to the screen (after the countdown timer has been deleted)
     * @param {string} newText - The new text that is to be written in place of the countdown
     * @param {number} animationSpeed - the speed at which the text is written 
     * @param {number} currentIndex - The current character index of the new text being written
     */
    #replaceAnimation(newText, animationSpeed, currentIndex){
        // Check if there are still more character of the new text ot be written to the screen
        if (currentIndex <= newText.length){
            // Add all the characters (up-to `currentIndex`) of the new text to the screen and update `currentIndex` 
            this.#timer.textContent = newText.slice(0,currentIndex)
            currentIndex++

            // Animate the next frame of the replace animation
            setTimeout(()=>{
                this.#animationIDs[2] = requestAnimationFrame(()=>{
                        this.#replaceAnimation(newText, animationSpeed, currentIndex)
                })
            },animationSpeed)
        }

        // Once all the characters have been written to the screen
        else{
            this.#debug.log("TIMER REPLACE ANIMATION COMPLETE!", newText)

            // Cancel replace animation
            cancelAnimationFrame(this.#animationIDs[2])

            // Set timer's pointer events + cursor style to visually signify that the element can now be clicked
            this.#timer.style.pointerEvents= "visibleFill"
            this.#timer.style.cursor = "pointer"

            // Add `pointerdown` event listener on the element that dispatches the element's event (`#timerEvent`)
            this.#timer.addEventListener("pointerdown", ()=>{
                this.#debug.log("`TimerEnterEvent` dispatched!")
                document.dispatchEvent(this.#timerEvent)
            })

        }
    }
}

customElements.define("countdown-timer", TimerElement)