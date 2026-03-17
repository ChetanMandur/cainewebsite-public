var video = document.getElementById("video")
var canvas = document.getElementById("canvas")
var canvasContext = canvas.getContext("2d")

var muteButton = document.getElementById("muteButton")

function paintCanvas(){
    canvasContext.drawImage(video, 0,0, canvas.width,canvas.height)
    requestAnimationFrame(()=>{paintCanvas()})

}

muteButton.addEventListener("click", ()=>{
    video.muted = !video.muted
    if (video.muted){
        // muteButton.src = "https://www.svgrepo.com/show/506727/mute.svg"
        muteButton.textContent = "Sound On"
    }
    else{
        // muteButton.src = "https://www.svgrepo.com/show/506778/volume-up.svg"
        muteButton.textContent = "Sound Off"
    }
})

requestAnimationFrame(()=>{
    video.play()
    paintCanvas()
})