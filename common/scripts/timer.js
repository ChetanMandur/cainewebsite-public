let timerElement = undefined

let releaseDate = undefined

let releaseDateFetchURL = undefined
let timerEnterHandler = (event)=>{console.warn("timerEnterHandler undefined \n Please define ")}

async function getReleaseDate(){
    const releaseDateResponse = await fetch(releaseDateFetchURL)
    if (releaseDateResponse.ok){
        const result = await releaseDateResponse.json()
        console.log(result)
        return (new Date(
            new Date(
                result.year, result.month, result.day, result.hours, result.minutes, result.seconds
            ).toLocaleString(
                "en-US", {timeZone: "America/New_York"}
            )
        )).getTime()
    }
    else{
        return (new Date ("April 21, 2040 00:00:00")).getTime()
    }
}

// ----------------------------------------------------------------------------------------------

let timerUpdateAnimationID = null
function updateTimerAnimation(){
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

    timerElement.textContent = days + ":" + hours + ":" + minutes + ":" + seconds + ":" + milliseconds;

    if (distance <= 0){
        // console.log("STOP!", distance)
        timerElement.textContent = "00" + ":" + "00" + ":" + "00" + ":" + "00" + ":" + "000";
        cancelAnimationFrame(timerUpdateAnimationID)

        timerDeleteAnimationID=requestAnimationFrame(()=>{deleteTimerTextAnimation(timerElement.textContent.length)})
    }
    else{
        timerUpdateAnimationID = requestAnimationFrame(()=>{updateTimerAnimation()})
    }
}

let timerDeleteAnimationID = null
const deleteTimerTextAnimationSpeed = 200
function deleteTimerTextAnimation(timerSize){
    if (timerSize >= 0){
        timerElement.textContent = timerElement.textContent.slice(0,timerSize)
        timerSize--
        setTimeout(()=>{
           timerDeleteAnimationID = requestAnimationFrame(()=>{
                deleteTimerTextAnimation(timerSize)
           })
        },deleteTimerTextAnimationSpeed)
        
    }
    else{
        cancelAnimationFrame(timerDeleteAnimationID)

        timerReplaceAnimationID=requestAnimationFrame(()=>{replaceTimerTextAnimation("ENTER",0)})

    }
}

let timerReplaceAnimationID = null
const replaceTimerTextAnimationSpeed = 500
function replaceTimerTextAnimation(newText, currentIndex){
    if (currentIndex <= newText.length){
        timerElement.textContent = newText.slice(0,currentIndex)
        currentIndex++

        setTimeout(()=>{
           timerReplaceAnimationID = requestAnimationFrame(()=>{
                replaceTimerTextAnimation(newText, currentIndex)
           })
        },replaceTimerTextAnimationSpeed)
    }
    else{
        cancelAnimationFrame(timerReplaceAnimationID)

        timerElement.style.pointerEvents= "visibleFill"
        timerElement.style.cursor = "pointer"
        timerElement.addEventListener("pointerdown",timerEnterHandler)
    }
}

// ----------------------------------------------------------------------------------------------


export default function initalizeTimer(timer, enterHandler){
    if (timer == undefined || enterHandler == undefined){
        console.error("You didn't give a timer URL and/or enter handler for when the timer finishes")
        return new Error("undefined parameter(s)")
    }

    timerElement = document.getElementById("timer")

    releaseDateFetchURL = timer
    timerEnterHandler = enterHandler

    getReleaseDate().then((result)=>{
        releaseDate = result
    }).finally(()=>{
        timerUpdateAnimationID = requestAnimationFrame(()=>{updateTimerAnimation()})
    })
}