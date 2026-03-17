const sections = Array.from(document.getElementsByClassName("section"))
const sectionsSize = sections.length

var currentSection = 0 

function scrollUp(){
    if (currentSection >0){
        currentSection--
        // console.log(currentSection)

    }
    scrollCaseHandler()
}

function scrollDown(){
    if (currentSection < sectionsSize-1){
        currentSection++
        // console.log(currentSection)
    }
    scrollCaseHandler()

}

function scrollCaseHandler(forcedSection){
    if (forcedSection!= null){
        currentSection = forcedSection
    }
    function toTheTop(sectionPart){
        sectionPart.forEach(element => {
            element.style.top="-100%"
        });
    }

    function toTheBottom(sectionPart){
        sectionPart.forEach(element => {
            element.style.top="100%"
        });
    }

    switch (currentSection) {
        case 0:
            sections[0].style.top="0%"

            toTheBottom(sections.slice(1))
            break;
        case 1:
            sections[0].style.top="0%"
            sections[1].style.top="0%"

            toTheBottom(sections.slice(2))

            break;
        case 2:
            toTheTop(sections.slice(0,2))
            sections[2].style.top="0%"
            toTheBottom(sections.slice(3))
            break;

        case 3:
            toTheTop(sections.slice(0,2))
            sections[2].style.top="0%"
            sections[3].style.top="0%"
            toTheBottom(sections.slice(4))

            break;

        case 4:
            toTheTop(sections.slice(0,2))
            sections[2].style.top="0%"
            sections[3].style.top="0%"
            sections[4].style.top="0%"
            toTheBottom(sections.slice(5))
            break;
        case 5:
            toTheTop(sections.slice(0,5))
            sections[5].style.top="0%"
            break;
        default:
            break;
    }
}

document.addEventListener("wheel",(event)=>{
    event.stopPropagation()
    if (event.deltaY > 0){
        scrollDown()
    }
    else if (event.deltaY < 0){
        scrollUp()
    }
})

// var lastScroll = 0
// document.addEventListener("pointermove", (event)=>{
// 	pointerDown = (event.buttons == 1) || (event.pressure > 0)

// 	if ((lastScroll < event.offsetY) && pointerDown){
// 		scrollUp()
// 	}
// 	else if ((lastScroll > event.offsetY) && pointerDown){
// 		scrollDown()
// 	}

// 	lastScroll = event.offsetY
// })

document.addEventListener("pointerdown", (event)=>{
    event.preventDefault()
    var pointerDownPosition = event.offsetY
    var pointerMovePosition = 0
    console.log("pointerDown", pointerDownPosition)

    function pointerMove (event) {
        event.preventDefault()

        pointerMovePosition = event.offsetY - pointerDownPosition
        console.log("pointerMove", pointerMovePosition)
    }
    document.addEventListener("pointermove", pointerMove)

    document.addEventListener("pointerup", (event)=>{
        event.preventDefault()
        console.log("pointerUp", pointerMovePosition)
        if (pointerMovePosition > 0){
            scrollUp()	

        }
        else if (pointerMovePosition < 0){
            scrollDown()

        }

        document.removeEventListener("pointermove", pointerMove)
    },{once:true})

})

document.addEventListener("keydown", (event)=>{
    console.log(event.key, event.shiftKey,)
    upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
    downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

    if (upPressed){
        scrollUp()
    }
    else if (downPressed){
        scrollDown()
    }

})