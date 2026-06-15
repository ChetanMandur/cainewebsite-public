export default class Timer {
    /**@type {HTMLDivElement} */
    #timerElement = undefined

    /**@type {string} */
    #dateURL = undefined

    /**@type {Date} */
    #dateObject = undefined

    /**@type {number} */
    #date = undefined

    /**@type {string} */
    #resultURL = undefined

    #result = undefined

    #enterHandler = undefined//( /**@type {PointerEvent}*/ event)=>{console.warn("timerEnterHandler undefined \n Please define ")}

    /**@type {number[]} */
    #animationIDs = [0,0,0]

    static TenSeconds = new Date((new Date()).getTime() + 11000)
    static FiveSeconds = new Date((new Date()).getTime() + 6000)


    /**
     * 
     * @param {string} dateURL
     * @param {string} resultURL 
     */
    constructor(date, resultURL){
        console.warn("TIMER.JS IS DEPRECATED")
        if (typeof date == "string"){
            this.#dateURL = date
        }
        if (date instanceof Date){
            this.#dateObject = date
        }

        this.#resultURL = resultURL

        this.#timerElement = document.getElementById("timer")
    }

    /**
     * @param {(event:PointerEvent)=>void} enterHandler 
     */
    set enterHandler(enterHandler){
        this.#enterHandler = enterHandler
    }

    start(){
        this.#getDate().then((date)=>{
            this.#date = date
        }).finally(()=>{
            this.#animationIDs[0] = requestAnimationFrame(()=>{this.#countAnimation()})
        })
    }

// ======================================================================================================
    async getResult(){
        if (this.#result == undefined){
            const response = await fetch(this.#resultURL)
            if (response.ok){
                this.#result = response
            }
            else{
                console.error("ERROR GETTING RESULT DATA!")
                return undefined
            }
        }
        return (this.#result).clone()

    }

    /**
     * @returns {number} Release Date in milliseconds (-1 if error)
     */
    async #getDate(){
        if (this.#dateURL != undefined){
            const response = await fetch(this.#dateURL)

            if (response.ok){
                const result = await response.json()
                // console.log(result)
                return (new Date(
                    new Date(
                        result.year, result.month, result.day, result.hours, result.minutes, result.seconds
                    ).toLocaleString(
                        "en-US", {timeZone: "America/New_York"}
                    )
                )).getTime()
            }
            else{
                // return (new Date ("April 21, 2040 00:00:00")).getTime()
                return -1
            }
        }
        else if (this.#dateObject != undefined){
            return this.#dateObject.getTime()
        }
        
    }

// ======================================================================================================

    #countAnimation(){
        const distance = this.#date - (new Date().getTime());

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

        this.#timerElement.textContent = days + ":" + hours + ":" + minutes + ":" + seconds + ":" + milliseconds;

        if (distance <= 0){
            // console.log("STOP!", distance)
            this.#timerElement.textContent = "00" + ":" + "00" + ":" + "00" + ":" + "00" + ":" + "000";
            cancelAnimationFrame(this.#animationIDs[0])

            this.#animationIDs[1]=requestAnimationFrame(()=>{this.#deleteAnimation(this.#timerElement.textContent.length, 200)})
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
            this.#timerElement.textContent = this.#timerElement.textContent.slice(0,timerSize)
            timerSize--
            setTimeout(()=>{
                this.#animationIDs[1] = requestAnimationFrame(()=>{
                        this.#deleteAnimation(timerSize,animationSpeed)
                })
            },animationSpeed)
            
        }
        else{
            cancelAnimationFrame(this.#animationIDs[1])
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
            this.#timerElement.textContent = newText.slice(0,currentIndex)
            currentIndex++

            setTimeout(()=>{
                this.#animationIDs[2] = requestAnimationFrame(()=>{
                        this.#replaceAnimation(newText, currentIndex, animationSpeed)
                })
            },animationSpeed)
        }

        else{
            cancelAnimationFrame(this.#animationIDs[2])

            this.#timerElement.style.pointerEvents= "visibleFill"
            this.#timerElement.style.cursor = "pointer"
            if (this.#enterHandler == undefined){
                this.#timerElement.addEventListener("pointerdown", ()=>{console.error(".eventHandler not defined!")})
            }
            else{
                this.#timerElement.addEventListener("pointerdown",this.#enterHandler)
            }
        }
    }
}