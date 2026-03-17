var timer = document.getElementById("timer")

let releaseDate = new Date ("April 21, 2026 00:00:00").getTime()

function updateTimer(){
    var distance = releaseDate - (new Date().getTime());

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var milliseconds = Math.floor((distance % (1000)));
    
    
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
    requestAnimationFrame(()=>{updateTimer()})
}


requestAnimationFrame(()=>{
    updateTimer()
})