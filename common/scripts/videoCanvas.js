export default class VideoCanvas {
    /**@type {HTMLVideoElement[]} */
    #videoElements = []
    
    /**@type {HTMLCanvasElement[]} */
    #canvasElements = []

    /**@type {number[]} */
    #animationIDs = []

    /**@type {boolean} */
    #validConfig = false

    /**@type {string} */
    #vcID

    constructor (vcID){
        console.warn("VIDEOCANVAS CLASS IS DEPRECATED")
        // console.log("STARTING:", vcID)
        this.#vcID = vcID

        this.#videoElements = Array.from(document.getElementsByTagName("video")).filter(
            (video)=>{
                if (video.classList.contains("video-canvas")){
                    video.autoplay = true
                    video.hidden = true
                    video.muted = true
                    video.loop = true
                    video.playsInline = true
                    return true
                }
                return false
            }
        )
        this.#canvasElements = Array.from(document.getElementsByTagName("canvas")).filter(
            (canvas)=>{
                return canvas.classList.contains("video-canvas")
            }
        )
        this.#validConfig = (
            (
                (this.#videoElements.length)==(this.#canvasElements.length)
            ) 
            && 
            (
                (this.#videoElements.length != 0) && (this.#canvasElements.length != 0) 
            )
        )
        if (!this.#validConfig){
            console.error("Mis-match in video and canvas elements!\nThere are not equal amounts video and canvas elements!\nOr, there are no elements to hook onto!")
        }

        // console.log(this.#vcID, "INITALIZED!", this.#videoElements, this.#canvasElements,this.#validConfig)
    }

    play(){
        this.start()
    }

    start(){
        if (this.#validConfig){
            this.#videoElements.forEach((video, index)=>{
                const canvas = this.#canvasElements[index]
                // console.log("BEGINNING VIDEOS FOR", this.#vcID,":",video,canvas, index)
                
                video.addEventListener("loadedmetadata",()=>{
                    // console.log("METADATA LOADED!", this.#vcID)
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    video.play()
                    this.#animationIDs[index] = requestAnimationFrame(()=>{this.#paintCanvas(index)})
                })

            })
        }
    }

    /**
     * 
     * @param {HTMLVideoElement} video 
     * @param {HTMLCanvasElement} canvas
     * @param {number} index 
     */
    #paintCanvas(index){
        // console.log(this.#vcID, "IS PLAYING")
        
        const video = this.#videoElements[index]
        const canvas = this.#canvasElements[index]

        if (video.isConnected && canvas.isConnected){
            const canvasContext = canvas.getContext("2d")
            canvasContext.drawImage(video, 0,0, canvas.width,canvas.height)
            this.#animationIDs[index] = requestAnimationFrame(()=>this.#paintCanvas(index))
        }
        else{
            this.#videoElements[index] = undefined
            this.#canvasElements[index] = undefined
            this.#animationIDs[index] = undefined
            this.#isAlive()
        }   
    }


    #isAlive(){
        var isAlive = false
        for (const value of this.#videoElements){
            if (value != undefined){
                isAlive = true
                break;
            }
        }

        if (!isAlive){
            this.#videoElements = undefined
            this.#canvasElements = undefined
            this.#animationIDs = undefined
            this.#validConfig = undefined
            this.#vcID = undefined
        }
    }
}