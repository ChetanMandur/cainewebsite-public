var sections = undefined
var currentSection = 0 
// -----------------------------------------------------------------
//// SECTION MANIPULATION ////

//// Singular section manipulation
function toTheTop(index){
    sections[index].style.top="-100%"
}

function toTheCenter(index){
    sections[index].style.top="0%"
}

function toTheBottom(index){
    sections[index].style.top="100%"
}


//// Group section manipulation
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


//// SECTION SCROLL HANDLING ////
// Function to handle what sections appear at which scroll index
//  - This function is defined by user when calling initalizeScroll()
var scrollSwitchCase = (section) =>{}

var scrollSwitchDefaultCase = (section) =>{
    chunkToTheTop(0,section)
    chunkToTheCenter(section, section+1)
    chunkToTheBottom(section+1)
}

// Helper function to scroll to handle scrolling
//  - Used as a wrapper to scrollSwitchCase()
//      - Done so that logic for scroll to a specific section index (rather than the global value for currentSection) is common for all scrollSwitchCase()
//          - aka, don't need to redefine the (albeit) simple logic for each scrollSwitchCase() definiton
function scrollHandler(forcedSection){
    if (forcedSection!= null){
        currentSection = forcedSection
    }
    console.log(currentSection)
    scrollSwitchCase(currentSection)
}

//// Helper functions used when scrolling
////    - Used to limit manipulation on the currentSection value, so it won't go out of range
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

// -----------------------------------------------------------------
//// SCROLL EVENT DEFINITIONS ////
// Scroll Wheel Event (Throttle function)
var scrolledDate = 0
function scrollWheelEvent (event){
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
}

// Click and Drag Event (For mobile devices)
function scrollPointerDownEvent(event){
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
}

// Key Down Event (For keyboard based scrolling)
function scrollKeyDownEvent(event){
    const upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
    const downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

    if (upPressed){
        scrollUp()
    }
    else if (downPressed){
        scrollDown()
    }
}

// -----------------------------------------------------------------
//// INITALIZE FUNCTION /////
function initalizeScroll(newSwitchCase){
    scrolledDate = 0
    currentSection = 0
    document.removeEventListener("wheel", scrollWheelEvent)
    document.removeEventListener("pointerdown", scrollPointerDownEvent)
    document.removeEventListener("keydown", scrollKeyDownEvent)

    sections = Array.from(document.getElementsByClassName("section"))
    if (newSwitchCase == undefined){
         console.warn(
            "scrollSwitchCase() not defined \n",
            "- Pass function as sole function parameter with function signature (section)=>{void} \n",
            "Using default switch case..."
        )
        scrollSwitchCase = (section)=>{
            switch (section) {
                default:
                    scrollSwitchDefaultCase(section)
                    break;
            }
        }
    }
    else{
        scrollSwitchCase = newSwitchCase
    }

    scrollHandler(0)

    document.addEventListener("wheel", scrollWheelEvent)
    document.addEventListener("pointerdown", scrollPointerDownEvent)
    document.addEventListener("keydown", scrollKeyDownEvent)

}


// -----------------------------------------------------------------
//// FUNCTION EXPORTS ////
export {initalizeScroll}
export {toTheTop, toTheCenter, toTheBottom}
export {chunkToTheTop, chunkToTheCenter, chunkToTheBottom}
export {scrollHandler, scrollSwitchDefaultCase}

