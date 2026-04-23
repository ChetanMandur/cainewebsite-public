export default class VideoCanvas {
    /**@type {HTMLVideoElement[]} */
    #videoElements = []
    
    /**@type {HTMLCanvasElement[]} */
    #canvasElements = []

    /**@type {number[]} */
    #animationIDs = []

    /**@type {boolean} */
    #validConfig = false

    constructor (){
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

        else{
            document.addEventListener("DOMContentChanged", ()=>{
                this.#animationIDs.forEach((id)=>{
                    cancelAnimationFrame(id)
                })
            },{once:true})
        }
    }

    play(){
        this.start()
    }

    start(){
        if (this.#validConfig){
            this.#videoElements.forEach((video, index)=>{
                const canvas = this.#canvasElements[index]
                
                video.addEventListener("loadedmetadata",()=>{
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    video.play()
                    this.#animationIDs[index] = requestAnimationFrame(()=>{this.#paintCanvas(video, canvas,index)})

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
    #paintCanvas(video,canvas, index){
        const canvasContext = canvas.getContext("2d")
        canvasContext.drawImage(video, 0,0, canvas.width,canvas.height)
        this.#animationIDs[index] = requestAnimationFrame(()=>this.#paintCanvas(video,canvas,index))
    }



}