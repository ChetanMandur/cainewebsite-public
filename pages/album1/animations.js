const secondSection = document.getElementById("secondSection")

const arrayOfWords = [
    "CAN'T BREAK IT OFF",
    "IN THE END",
    "MY TIME IS SAFE",
    "LIE TO ME",
    "WON'T YOU",
    "FOR THE FLICKS",
    "SWEAR I'M BLESSED",
    "FUCK YOU CALL ME BACK FOR?",
    "NO DAYS OFF",
    "I DON'T DO THIS SHIT FOR YOU",
    "TAKE MY TIME WITH IT",
    "NEVER FOLD",
    "GOTTA KEEP IT REAL",
    "I BEEN SILENT",
    "YOUR MESSAGES BEEN SPIRALING",
    "GOTTA CHANGE MY NUMBER",
    "DON'T SIT BY",
    "TAKE ADVANTAGE",
    "PLAY IT REAL CLOSE",
    "I'VE BEEN",
    "DID I FOLD IT, BABY?"
]

function randomInt(max,min){
    return (Math.floor(Math.random() * (max - min + 1)) + min)
}

function moveElement(element,{topMax,topMin}, {leftMax,leftMin}){
    element.style.top = randomInt(topMax,topMin) + "%"
    element.style.left = randomInt(leftMax,leftMin) + "%"

}

// Moving word text
for (var i=0; i<50;i++){
    const newTextBox = document.createElement("h1")
    const newTextBoxContent = document.createTextNode(arrayOfWords[Math.floor(Math.random() * arrayOfWords.length )])
    newTextBox.appendChild(newTextBoxContent)

    moveElement(newTextBox, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )

    secondSection.appendChild(newTextBox)

    setInterval(()=>{
        newTextBox.textContent = arrayOfWords[Math.floor(Math.random() * arrayOfWords.length )]
    }, 100)

    setInterval(()=>{
        moveElement(newTextBox, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )
    },500)
}

// Moving number text
for (var i=0; i<50;i++){
    const newTextBox = document.createElement("h1")

    numberMax = 9999999
    numberMin = 1000000
    const newTextBoxContent = document.createTextNode(randomInt(numberMax, numberMin) )

    newTextBox.appendChild(newTextBoxContent)

    moveElement(newTextBox, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )

    secondSection.appendChild(newTextBox)

    setInterval(()=>{
        newTextBox.textContent = randomInt(numberMax, numberMin) 
    }, 50)

    setInterval(()=>{
        moveElement(newTextBox, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )
    },1000)
}

// Moving Star 
for (var i=0; i<10; i++){
    for (var j=0; j<4;j++){
        const newImage = document.createElement("img")
        secondSection.appendChild(newImage)
        
        switch (j) {
            case 0:
                newImage.src = "/pages/album1/assets/images/star1.png"
                break;
            case 1:
                newImage.src = "/pages/album1/assets/images/star2.png"
                break;
            case 2:
                newImage.src = "/pages/album1/assets/images/star3.png"
                break;
            case 3:
                newImage.src = "/pages/album1/assets/images/star4.png"
                break;
            default:
                break;
        }
        
        newImage.style.transform = "rotateZ(" + randomInt(359,0) +"deg)"
        
        moveElement(newImage, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )

        setInterval(()=>{
            moveElement(newImage, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )
        },500)
    }
}

// Moving eyeball
for (var i=0; i<10; i++){
    const newImage = document.createElement("img")
        secondSection.appendChild(newImage)
        newImage.src = "/pages/album1/assets/images/doodle4.png"

        newImage.style.transform = "rotateZ(" + randomInt(40,-40) +"deg)"

        moveElement(newImage, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )

        setInterval(()=>{
            moveElement(newImage, {topMax:100,topMin:0}, {leftMax:100, leftMin:0} )
        },3000)

        setInterval(()=>{
            newImage.src = "/pages/album1/assets/images/doodle4part2.png"
            setTimeout(()=>{
                newImage.src = "/pages/album1/assets/images/doodle4.png"
            },randomInt(600,50))

        },randomInt(3000,1000))
}

