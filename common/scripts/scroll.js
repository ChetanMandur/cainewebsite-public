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

    console.log(currentSection)

    function toTheTop(index){
        sections[index].style.top="-100%"
    }

    function toTheCenter(index){
        sections[index].style.top="0%"
    }

    function toTheBottom(index){
        sections[index].style.top="100%"
    }

    function chunkToTheTop(start, end){
        sections.slice(start,end).forEach((element, index) => {
            toTheTop(start+index)
        });
    }

    function chunkToTheCenter(start, end){
        sections.slice(start,end).forEach((element, index)=>{
            toTheCenter(start+index)
        })
    }

    function chunkToTheBottom(start, end){
        sections.slice(start,end).forEach((element, index) => {
            toTheBottom(start+index)
        });
    }

    

    switch (currentSection) {
        case 0:
            chunkToTheCenter(0,1)
            chunkToTheBottom(1)
            break;
        case 1:
            chunkToTheCenter(0,2)
            chunkToTheBottom(2)

            break;
        
        case 2:
            chunkToTheTop(0,1)
            chunkToTheCenter(1,3)
            chunkToTheBottom(3)
            break;

        case 3:
            chunkToTheTop(0,3)
            toTheCenter(1)
            toTheCenter(3)
            chunkToTheBottom(4)
            break;
        
        case 4:
            chunkToTheTop(0,4)
            toTheCenter(1)
            chunkToTheCenter(4,5)
            chunkToTheBottom(5)
            break;

        case 5:
            chunkToTheTop(0,4)
            toTheCenter(1)

            chunkToTheCenter(4,7)
            chunkToTheBottom(6)
            break;

        case 6:
            chunkToTheTop(0,4)
            toTheCenter(1)

            chunkToTheCenter(4,7)
            chunkToTheBottom(7)
            break;


        default:
            chunkToTheTop(0,currentSection)
            chunkToTheCenter(currentSection, currentSection+1)
            chunkToTheBottom(currentSection+1)
            break;
    }
}

// //Debounce function 1
// var scrollTimeoutID 
// document.addEventListener("wheel", (event)=>{
// 	console.log("wheelevent")
// 	clearTimeout(scrollTimeoutID)
    
// 	scrollTimeoutID = setTimeout(()=>{
// 		console.log("hit!")
// 		if (event.deltaY > 0){
// 			scrollDown()
// 		}
// 		else if (event.deltaY < 0){
// 			scrollUp()
// 		}
// 	},200)
// })

// // Debounce function 2
// var scrollTimeoutID
// var canScroll = true
// document.addEventListener("wheel", (event)=>{
// 	clearTimeout(scrollTimeoutID)
// 	console.log("wheel event")
// 	scrollTimeoutID = setTimeout(()=>{
// 		canScroll = true
// 	},500)

// 	if (canScroll){
// 		canScroll = false
// 		if (event.deltaY > 0){
// 			scrollDown()
// 		}
// 		else if (event.deltaY < 0){
// 			scrollUp()
// 		}
// 	}
// })

// Throttle function
var scrolledDate = 0
document.addEventListener("wheel", (event)=>{
    const date = new Date().getTime()
    // console.log((date - scrolledDate))
    if ((date - scrolledDate) > 500){
        if (event.deltaY > 0){
            scrollDown()
        }
        else if (event.deltaY < 0){
            scrollUp()
        }
        scrolledDate = new Date().getTime()
    }

})

document.addEventListener("pointerdown", (event)=>{
    event.preventDefault()
    var pointerDownPosition = event.offsetY
    var pointerMovePosition = 0
    // console.log("pointerDown", pointerDownPosition)

    function pointerMove (event) {
        event.preventDefault()

        pointerMovePosition = event.offsetY - pointerDownPosition
        // console.log("pointerMove", pointerMovePosition)
    }
    document.addEventListener("pointermove", pointerMove)

    document.addEventListener("pointerup", (event)=>{
        event.preventDefault()
        // console.log("pointerUp", pointerMovePosition)
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
    // console.log(event.key, event.shiftKey,)
    const upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
    const downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

    if (upPressed){
        scrollUp()
    }
    else if (downPressed){
        scrollDown()
    }

})