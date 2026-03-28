var timer = document.getElementById("timer")

let releaseDate = undefined

async function getReleaseDate(){
    const releaseDateResponse = await fetch("https://broken-fire-bf4e.chetanmandur45.workers.dev/get/releaseDate")
    if (releaseDateResponse.ok){
        const result = await releaseDateResponse.json()
        console.log(result.releaseDate)
        return new Date(new Date(result.year, result.month, result.day, result.hours, result.minutes, result.seconds).toLocaleString("en-US", {timeZone: "America/New_York"}))
    }
    else{
        return new Date ("April 21, 2040 00:00:00").getTime()
    }
}

let timerUpdateAnimationID = null

function updateTimer(){
    var distance = releaseDate - (new Date().getTime());

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

    timer.textContent = days + ":" + hours + ":" + minutes + ":" + seconds + ":" + milliseconds;

    if (distance <= 0){
        // console.log("STOP!", distance)
        timer.textContent = "00" + ":" + "00" + ":" + "00" + ":" + "00" + ":" + "000";
        cancelAnimationFrame(timerUpdateAnimationID)

        var timerSize = timer.textContent.length
        var timerDeleteAnimationId = null
        function deleteTimerText(){
            if (timerSize >= 0){
                timer.textContent = timer.textContent.slice(0,timerSize)
                timerSize--
            }
            else{
                clearInterval(timerDeleteAnimationId)

                var timerNewText = "ENTER"
                var timerNewTextCurrentIndex = 0
                var timerReplaceAnimationID = null
                function replaceTimerText(){
                    if (timerNewTextCurrentIndex <= timerNewText.length){
                        timer.textContent = timerNewText.slice(0,timerNewTextCurrentIndex)
                        timerNewTextCurrentIndex++
                    }
                    else{
                        clearInterval(timerReplaceAnimationID)
                        timer.style.pointerEvents= "visibleFill"
                        timer.style.cursor = "pointer"
                        timer.addEventListener("pointerdown",()=>{
                            var overlay = document.getElementById("overlay")
                            var sectionsContainer = document.getElementById("sections-container")
                            var youtubeVideoContainer = document.getElementById("youtube-video-container")
                            var youtubeVideo = document.getElementById("youtube-video")
                            var errorContainer = document.getElementById("error-container")
                            
                            async function getYoutubeLink(){
                                const youtubeLinkResponse = await fetch("https://broken-fire-bf4e.chetanmandur45.workers.dev/get/youtubeLink")
                                if (youtubeLinkResponse.ok){
                                    const result = await youtubeLinkResponse.json()
                                    console.log(result.youtubeLink)
                                    return result.youtubeLink
                                }
                                else{
                                    return "ERROR"
                                }
                            }

                            getYoutubeLink().then((result)=>{
                                if (result != "ERROR"){
                                    youtubeVideo.src = result
                                    youtubeVideoContainer.style.display="block"
                                }
                                else{
                                    console.log("not happy")
                                    errorContainer.style.display="block"
                                }
                                overlay.style.display="none"
                                sectionsContainer.style.display="none"
                            })
                        })
                    }
                }
                timerReplaceAnimationID = setInterval(()=>{replaceTimerText()},500)
            }
        }
        timerDeleteAnimationId=setInterval(()=>{deleteTimerText()},200)

    }
    else{
        timerUpdateAnimationID = requestAnimationFrame(()=>{updateTimer()})
    }
}

getReleaseDate().then((result)=>{
    releaseDate = result

    // let currentDate = new Date()
    // releaseDate = currentDate.setSeconds(currentDate.getSeconds() - 2)
}).finally(()=>{
        timerUpdateAnimationID= requestAnimationFrame(()=>{
                updateTimer()
            })
    }
)