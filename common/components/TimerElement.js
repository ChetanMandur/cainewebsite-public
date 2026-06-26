import Debug from "../functions/Debug.js"
class TimerEnteredEvent extends Event {
    
    /**@type {TimerElement} */
    #timerElement = undefined

    /**@param {TimerElement} sourceTimerElement */
    constructor(sourceTimerElement){
        super("TimerEntered")

        this.#timerElement = sourceTimerElement
    }

    get timer(){
        return this.#timerElement
    }

    get result(){
        return this.#timerElement.getResult()
    }
}

export default class TimerElement extends HTMLElement{
    // ATTRIBUTES DATA
    static observedAttributes = ["date", "result", "debug"]

    /**@type {string} */
    #dateAttribute = undefined

    /**@type {string} */
    #resultAttribute = undefined

    // CLASS DATA
    /**@type {Date} */
    #date = undefined

    /**@type {Response} */
    #result = undefined

    /**@type {Debug} */
    #debug = undefined

    /**@type {TimerEnterEvent} */
    #timerEvent = new TimerEnteredEvent(this)

    /**@type {number[]} */
    #animationIDs = [0,0,0]

    // ELEMENT DATA
    /**@type {ShadowRoot} */
    #shadow = undefined

    /**@type {HTMLHeadingElement} */
    #timer = undefined

    constructor(){
        super()

        this.#dateAttribute = this.getAttribute("date")
        this.#resultAttribute = this.getAttribute("result")

        this.#debug = new Debug(this.getAttribute("debug") == undefined ? false : true, "timer")

        const styleSheet = new CSSStyleSheet()
        styleSheet.replaceSync(
            `
                h1  {
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

        this.#shadow.appendChild(this.#timer)
    }

    connectedCallback(){
        this.#getDate().then((date)=>{
            this.#date = date
        }).finally(()=>{
            this.#animationIDs[0] = requestAnimationFrame(()=>{this.#countAnimation()})
        })
    }

    async #getDate(){
        if (this.#dateAttribute.slice(0,6) == "Timer."){
            switch (this.#dateAttribute.slice(6)) {
                case "FiveSeconds":
                    this.#debug.log("Using built-in date: 5 SECONDS")
                    return (new Date((new Date()).getTime() + 6000))
                    break;
                
                case "TenSeconds":
                    this.#debug.log("Using built-in date: 10 SECONDS")
                    return (new Date((new Date()).getTime() + 11000))
                    break;

                default:
                    console.error("DATE ATTRIBUTE ERROR")
                    break;
            }
        }
        else if (this.#dateAttribute.slice(0,8) == "https://"){
            this.#debug.log("Fetching Date:",this.#dateAttribute)
            const response = await fetch(this.#dateAttribute)

            if (response.ok){
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

    async getResult(){
        if (this.#result == undefined){
            this.#debug.log("Fetching Result:",this.#resultAttribute)
            const response = await fetch(this.#resultAttribute)

            if (response.ok){
                this.#debug.log("Result Response:", response)
                this.#result = response
            }
            else{
                console.error("ERROR GETTING RESULT DATA!")
                return undefined
            }
        }
        else{
            this.#debug.log("Result already fetched:", this.#result)
        }
        return (this.#result).clone()
    }

// ======================================================================================================

    #countAnimation(){
        const distance = this.#date.getTime() - (new Date().getTime());

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var milliseconds = Math.floor((distance % (1000)));

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

        this.#timer.textContent = days + ":" + hours + ":" + minutes + ":" + seconds + ":" + milliseconds;

        if (distance <= 0){
            this.#debug.log("TIMER COUNTDOWN COMPLETE!", distance)
            this.#timer.textContent = "00" + ":" + "00" + ":" + "00" + ":" + "00" + ":" + "000";
            cancelAnimationFrame(this.#animationIDs[0])

            this.#debug.log("Beginning timer delete animation")
            this.#animationIDs[1]=requestAnimationFrame(()=>{this.#deleteAnimation(this.#timer.textContent.length, 200)})
        }
        else{
            this.#animationIDs[0] = requestAnimationFrame(()=>{this.#countAnimation()})
        }
    }

    /**
     * 
     * @param {number} timerSize 
     * @param {number} animationSpeed 
     */
    #deleteAnimation(timerSize, animationSpeed){
        if (timerSize >= 0){
            this.#timer.textContent = this.#timer.textContent.slice(0,timerSize)
            timerSize--
            setTimeout(()=>{
                this.#animationIDs[1] = requestAnimationFrame(()=>{
                        this.#deleteAnimation(timerSize,animationSpeed)
                })
            },animationSpeed)
            
        }
        else{
            this.#debug.log("TIMER DELETE COMPLETE!", timerSize)
            cancelAnimationFrame(this.#animationIDs[1])
            this.#debug.log("Beginning timer text replace animation")
            this.#animationIDs[2]=requestAnimationFrame(()=>{this.#replaceAnimation("ENTER",0,500)})

        }
    }

    /**
     * 
     * @param {string} newText 
     * @param {number} currentIndex 
     * @param {number} animationSpeed 
     */
    #replaceAnimation(newText, currentIndex, animationSpeed){
        if (currentIndex <= newText.length){
            this.#timer.textContent = newText.slice(0,currentIndex)
            currentIndex++

            setTimeout(()=>{
                this.#animationIDs[2] = requestAnimationFrame(()=>{
                        this.#replaceAnimation(newText, currentIndex, animationSpeed)
                })
            },animationSpeed)
        }

        else{
            this.#debug.log("TIMER REPLACE ANIMATION COMPLETE!", newText)

            cancelAnimationFrame(this.#animationIDs[2])

            this.#timer.style.pointerEvents= "visibleFill"
            this.#timer.style.cursor = "pointer"
            this.#timer.addEventListener("pointerdown", ()=>{
                this.#debug.log("`TimerEnterEvent` dispatched!")
                document.dispatchEvent(this.#timerEvent)
            })

        }
    }
}

customElements.define("countdown-timer", TimerElement)