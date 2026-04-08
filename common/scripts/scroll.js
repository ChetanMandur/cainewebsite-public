const sections = Array.from(document.getElementsByClassName("section"))
var currentSection = 0 
var scrollInitalized = false


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

var scrollSwitchCase = (section) =>{}

function scrollHandler(forcedSection){
    if (forcedSection!= null){
        currentSection = forcedSection
    }
    console.log(currentSection)
    scrollSwitchCase(currentSection)
}

function scrollUp(){
    if (currentSection >0){
        currentSection--
    }
    scrollHandler()
}

function scrollDown(){
    if (currentSection < sections.length-1){
        currentSection++
    }
    scrollHandler()
}

function initalizeScroll(newSwitchCase){
    if (newSwitchCase != undefined && !scrollInitalized){
        scrollInitalized = true
        scrollSwitchCase = newSwitchCase

        // Throttle function
        var scrolledDate = 0
        document.addEventListener("wheel", (event)=>{
            const date = new Date().getTime()
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


            function pointerMove (event) {
                event.preventDefault()

                pointerMovePosition = event.offsetY - pointerDownPosition
            }
            document.addEventListener("pointermove", pointerMove)

            document.addEventListener("pointerup", (event)=>{
                event.preventDefault()
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
            const upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
            const downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

            if (upPressed){
                scrollUp()
            }
            else if (downPressed){
                scrollDown()
            }

        })
    }
    else{
        if (scrollInitalized){
            console.error(
                "Scroll already has been initalized! Won't be initalized"
            )
        }
        else if (newSwitchCase == undefined){
            console.error(
                "scrollSwitchCase() not defined \n",
                "Pass function as sole function parameter \n",
                "Use function signature (section)=>{void}"
            )
        }
    }

}

export {initalizeScroll}
export {toTheTop, toTheCenter, toTheBottom}
export {chunkToTheTop, chunkToTheCenter, chunkToTheBottom}
export {scrollHandler}

