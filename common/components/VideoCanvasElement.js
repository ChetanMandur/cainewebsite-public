class VideoCanvasElement extends HTMLElement{    
    //// Attributes
    static observedAttributes = ["src", "mobile-fit", "desktop-fit","quality"]

    /**Video source URL. Set using the `src` attribute  @type {string}*/
    #src = undefined

    /**@typedef {("contain"|"cover"|"fill"|"scale-down"|"none")} ObjectFits*/

    /**Object fit type for mobile displays. Set using the `mobile-fit` attribute @type {ObjectFits} */
    #mobileFit = undefined

    /**Object fit type for desktop displays. Set using the `desktop-fit` attribute @type {ObjectFits} */
    #desktopFit = undefined

    /**Video quality (in reality: canvas pixel sizing). Set using the `quality` attribute @type {"high"|"low"} */
    #quality = undefined

    //// Private Variables
    /**Whether or not the instance is valid. Ie, the element contains all required attributes to display video (`src` and `mobile/desktop-fit`) @type {boolean} */
    #validConfig = false

    /**The current ID of the `requestAnimationFrame()` function @type {number} */
    #animationID

    /**The shadow DOM for the element @type {ShadowRoot} */
    #shadow

    /**The `<video>` tag for the element @type {HTMLVideoElement} */
    #video

    /**The `<canvas>` tag for the element @type {HTMLCanvasElement} */
    #canvas

    constructor(){
        super()

        // Grabbing Attributes
        this.#src = this.getAttribute("src")
        this.#mobileFit = this.getAttribute("mobile-fit")
        this.#desktopFit = this.getAttribute("desktop-fit")
        this.#quality = this.getAttribute("quality") ?? "high"

        // Checks if valid
        if (this.#validConfigCheck()){
            // Begin styling component
            this.style.height = "100%"
            this.style.width = "100%"

            const stylesheet = new CSSStyleSheet()

            stylesheet.replaceSync(
                `
                    canvas {
                        width: 100%;
                        height: 100%;

                        @media screen and (width <= 1000px) {
                            &.mobile-fill {
                                object-fit:fill;
                            }
                            
                            &.mobile-contain {
                                object-fit:contain;
                            }

                            &.mobile-cover {
                                object-fit:cover;
                            }
                            
                            &.mobile-scale-down {
                                object-fit:scale-down;
                            }

                            &.mobile-none {
                                object-fit:none;
                            }
                        }

                        @media screen and (width > 1000px) {
                            &.desktop-fill {
                                object-fit:fill;
                            }

                            &.desktop-contain {
                                object-fit:contain;
                            }

                            &.desktop-cover {
                                object-fit:cover;
                            }
                            
                            &.desktop-scale-down {
                                object-fit:scale-down;
                            }

                            &.desktop-none {
                                object-fit:none;
                            }
                        }
                    }
                `
            )

            // Create Shadow DOM and attach stylesheet
            this.#shadow = this.attachShadow({mode:"open"})
            this.#shadow.adoptedStyleSheets = [stylesheet]

            // Create `<video>` tag and set attributes
            this.#video = document.createElement("video")
            this.#video.autoplay = true
            this.#video.hidden = true
            this.#video.muted = true
            this.#video.loop = true
            this.#video.playsInline = true
            this.#video.src = this.#src

            // Create `<canvas>` tag and set attributes
            this.#canvas = document.createElement("canvas")
            this.#canvas.classList.add(`mobile-${this.#mobileFit}`)
            this.#canvas.classList.add(`desktop-${this.#desktopFit}`)
            
            // Add tags to Shadow DOM
            this.#shadow.appendChild(this.#video)
            this.#shadow.appendChild(this.#canvas)

            // Begin playing the video/starting the animation loop
            this.#play()
        }
    }

    /**
     * Checks if the fit value given is valid given the expected values
     * @param {ObjectFits} fit 
     * @returns {boolean}
     */
    #validFitCheck(fit){
        if ((fit == "contain") || (fit == "cover") || (fit == "fill") || (fit == "scale-down") || (fit == "none")){
            return true
        }
        return false
    }

    /**
     * Goes through checks to see if required attributes are present and of valid values
     * @returns {boolean} - Calculated value for `validConfig`
     */
    #validConfigCheck(){
        var check = true

        // SRC CHECK
        if ((this.#src == null) || (this.#src == undefined) || (this.#src.replaceAll(" ", "") == "")){
            console.error("<video-element> is missing the `src` attribute!\nPlease provide a valid source URL!")
            check = false
        }

        // MOBILE-FIT CHECK
        if ((this.#mobileFit == null) || (this.#mobileFit == undefined)){
            console.error("<video-element> is missing the `mobile-fit` attribute!\nPlease provide a valid value for the attribute!")
            check = false
        }
        else if (!(this.#validFitCheck(this.#mobileFit))){
            console.error("<video-element> has an invalid `mobile-fit` attribute!\nPlease provide a valid value for the attribute!")
            check = false
        }

        // DESKTOP-FIT CHECK
        if ((this.#desktopFit == null) || (this.#desktopFit == undefined)){
            console.error("<video-element> is missing the `desktop-fit` attribute!\nPlease provide a valid value for the attribute!")
            check = false
        }
        else if (!(this.#validFitCheck(this.#desktopFit))){
            console.error("<video-element> has an invalid `desktop-fit` attribute!\nPlease provide a valid value for the attribute!")
            check = false
        }

        // QUALITY CHECK
        if ((this.#quality != "high") && (this.#quality != "low")){
            console.error("<video-element> has an invalid `quality` attribute!\nPlease provide a valid value for the attribute!")
            check = false
        }

        this.#validConfig = check
        return this.#validConfig
    }

    /**
     * Wrapper function for `requestAnimationFrame()`
     * @returns 
     */
    #animate(){
        return (requestAnimationFrame(()=>{this.#paintCanvas()}))
    }

    /**
     * Function used to handle drawing video frame to canvas
     */
    #paintCanvas(){
        if (this.#video.isConnected && this.#canvas.isConnected){
            const canvasContext = this.#canvas.getContext("2d")
            canvasContext.drawImage(this.#video,0,0, this.#canvas.width, this.#canvas.height)
            this.#animationID = this.#animate()
        }
    }

    /**
     * Function used to begin playing the video and the animation loop of drawing the video frames to the canvas
     */
    #play(){
        this.#video.addEventListener("loadedmetadata",()=>{
            if (this.#quality == "high"){
                this.#canvas.width = this.#video.videoWidth
                this.#canvas.height = this.#video.videoHeight
            }

            this.#video.play()
            this.#animationID = this.#animate()

        })
    }

    /**
     * Called when the element is added into DOM
     * 
     * (Unused)
     */
    connectedCallback(){
        // first add
        // console.log("VideoElement added")
    }

    /**
     * Called when the element is removed from DOM
     * 
     * Cancels the current animation frame (and thus, the animation loop)
     */
    disconnectedCallback(){
        // console.log("VideoElement removed")
        cancelAnimationFrame(this.#animationID)
    }

    /**
     * Called when the element's attributes are modified. Called both at start and during lifecycle
     * 
     * Gracefully updates element's private variables based on the new given attributes
     * @param {string} name 
     * @param {string} oldValue 
     * @param {string} newValue 
     */
    attributeChangedCallback(name, oldValue, newValue){
        // attribute changed
        // console.log("VideoElement attribute", name, "changed from", oldValue, "to", newValue)
        if ((oldValue != undefined) && (oldValue != null)){
            switch (name){
                case "src":
                    this.#src = newValue
                    break;

                case "mobile-fit":
                    this.#mobileFit = newValue
                    this.#canvas.classList.replace(`mobile-${oldValue}`,`mobile-${newValue}` )
                    break;

                case "desktop-fit":
                    this.#desktopFit = newValue
                    this.#canvas.classList.replace(`desktop-${oldValue}`,`desktop-${newValue}` )
                    break;
                
                default:
                    break;
            }
        }
    }
}

customElements.define("video-canvas", VideoCanvasElement)