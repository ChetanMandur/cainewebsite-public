var videos = Array.from(document.getElementsByTagName("video"))
var canvases = Array.from(document.getElementsByTagName("canvas"))

if (videos.length == canvases.length){
    for (var i=0; i<videos.length;i++){
        const video = videos[i]
        const canvas = canvases[i]
        const canvasContext = canvas.getContext("2d")
        video.play()

        function paintCanvas(video,canvas){
            canvasContext.drawImage(video, 0,0, canvas.width,canvas.height)
            requestAnimationFrame(()=>paintCanvas(video,canvas))
        }

        requestAnimationFrame(()=>{paintCanvas(video, canvas)})
    }
}
else{
    console.log("woahwoahwoah....woah")
}