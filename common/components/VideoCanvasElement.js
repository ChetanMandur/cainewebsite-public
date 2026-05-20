class VideoCanvasElement extends HTMLElement{
    static observedAttributes = ["src", "mobile-fit", "desktop-fit"]

    /**@type {string} */
    #src = undefined

    /**@type {"contain"|"cover"|"fit"} */
    #mobileFit = undefined

    /**@type {"contain"|"cover"|"fit"} */
    #desktopFit = undefined

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
        console.log("constructor")
        this.#src = this.getAttribute("src")
        this.#mobileFit = this.getAttribute("mobile-fit")
        this.#desktopFit = this.getAttribute("desktop-fit")

        this.#validConfigCheck()

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


        switch (this.#mobileFit) {
            case "contain":
                this.#canvas.classList.add("mobile-contain")
                break;
            case "cover":
                this.#canvas.classList.add("mobile-cover")
                break
            case "fit":
                this.#canvas.classList.add("mobile-fill")
                break
            default:
                break;
        }

        switch (this.#desktopFit) {
            case "contain":
                this.#canvas.classList.add("desktop-contain")
                break;
            case "cover":
                this.#canvas.classList.add("desktop-cover")
                break
            case "fill":
                this.#canvas.classList.add("desktop-fill")
                break
            default:
                break;
        }

        this.#shadow.appendChild(this.#video)
        this.#shadow.appendChild(this.#canvas)

        if (this.#validConfig){
            this.#play()
        }
    }

    #validConfigCheck(){
        this.#validConfig = (
            ((this.#src != null) && (this.#src !=undefined)) && 
            ((this.#mobileFit != null) && (this.#mobileFit !=undefined)) && 
            ((this.#desktopFit != null) && (this.#desktopFit !=undefined))
        )
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
            this.#canvas.width = this.#video.videoWidth
            this.#canvas.height = this.#video.videoHeight

            this.#video.play()
            this.#animationID = this.#animate()

        })
    }

    connectedCallback(){
        // first add
        console.log("VideoElement added")
    }

    disconnectedCallback(){
        console.log("VideoElement removed")
        // removed 
    }

    attributeChangedCallback(name, oldValue, newValue){
        // attribute changed
        console.log("VideoElement attribute", name, "changed from", oldValue, "to", newValue)
        switch (name) {
            case "src":
                break;
            
            case "mobileFit":
                break;

            case "desktopFit":
                break;
            default:
                break;
        }
    }
}

console.log("yoo")
customElements.define("video-canvas", VideoCanvasElement)