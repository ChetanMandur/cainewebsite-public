var bottomTextBoxes = document.getElementsByClassName("bottomChangingText")
var bottomTextNumbers = document.getElementsByClassName("bottomChangingNumber")

setInterval(()=>{
    var eyeball = document.getElementById("doodle4")

    eyeball.src = "./public/doodle4part2.png"
    setTimeout(()=>{
        eyeball.src = "./public/doodle4.png"
    },500)

},3000)

const arrayOfWords = [
    "i think im forever",
    "im on the ropes",
    "im never here",
    "lie to me",
    "dollar menu millionaire",
    "why wouldnt you",

]

Array.from(bottomTextBoxes).forEach((element)=>{
            element.textContent = arrayOfWords[Math.floor(Math.random() * arrayOfWords.length )]
})

Array.from(bottomTextNumbers).forEach((element)=>{
            element.textContent = Math.floor(Math.random()*100000000000000000000000)
})

setInterval(()=>{
    Array.from(bottomTextBoxes).forEach((element)=>{
            element.textContent = arrayOfWords[Math.floor(Math.random() * arrayOfWords.length )]
    })


}, 200)

setInterval(()=>{
    Array.from(bottomTextNumbers).forEach((element)=>{
            element.textContent = Math.floor(Math.random()*100000000000000000)
    })

	}, 50)