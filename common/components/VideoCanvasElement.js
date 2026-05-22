class VideoCanvasElement extends HTMLElement{
    
    // Attributes
    static observedAttributes = ["src", "mobile-fit", "desktop-fit","quality"]

    /**@type {string} */
    #src = undefined

    /**@type {"contain"|"cover"|"fit"} */
    #mobileFit = undefined

    /**@type {"contain"|"cover"|"fit"} */
    #desktopFit = undefined

    /**@type {"high"|"low"} */
    #quality = undefined

    // Private Variables
    /**@type {boolean} */
    #validConfig = false

    /**@type {number} */
    #animationID

    /**@type {ShadowRoot} */
    #shadow

    /**@type {HTMLVideoElement} */
    #video

    /**@type {HTMLCanvasElement} */
    #canvas

    constructor(){
        super()
        this.#src = this.getAttribute("src")
        this.#mobileFit = this.getAttribute("mobile-fit")
        this.#desktopFit = this.getAttribute("desktop-fit")
        this.#quality = this.getAttribute("quality") ?? "high"

        if (this.#validConfigCheck()){
            
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
                        }
                    }
                `
            )

            this.#shadow = this.attachShadow({mode:"open"})
            this.#shadow.adoptedStyleSheets = [stylesheet]

            this.#video = document.createElement("video")
            this.#video.autoplay = true
            this.#video.hidden = true
            this.#video.muted = true
            this.#video.loop = true
            this.#video.playsInline = true
            this.#video.src = this.#src

            this.#canvas = document.createElement("canvas")


            this.#canvas.classList.add(`mobile-${this.#mobileFit}`)
            this.#canvas.classList.add(`desktop-${this.#desktopFit}`)

            this.#shadow.appendChild(this.#video)
            this.#shadow.appendChild(this.#canvas)

            this.#play()

        }
        else{
            console.error("<video-canvas> is not a valid config")
        }
    }

    #validConfigCheck(){
        this.#validConfig = (
            ((this.#src != null) && (this.#src !=undefined)) && 
            ((this.#mobileFit != null) && (this.#mobileFit !=undefined)) && 
            ((this.#desktopFit != null) && (this.#desktopFit !=undefined)) &&
            ((this.#quality == "high") || (this.#quality == "low")) 
        )

        return this.#validConfig
    }

    #animate(){
        return (requestAnimationFrame(()=>{this.#paintCanvas()}))
    }

    #paintCanvas(){
        if (this.#video.isConnected && this.#canvas.isConnected){
            const canvasContext = this.#canvas.getContext("2d")
            canvasContext.drawImage(this.#video,0,0, this.#canvas.width, this.#canvas.height)
            this.#animationID = this.#animate()
        }
    }

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

    connectedCallback(){
        // first add
        // console.log("VideoElement added")
    }

    disconnectedCallback(){
        // console.log("VideoElement removed")
        cancelAnimationFrame(this.#animationID)
    }

    attributeChangedCallback(name, oldValue, newValue){
        // attribute changed
        console.log("VideoElement attribute", name, "changed from", oldValue, "to", newValue)
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