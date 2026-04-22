export default class SlideScroll {
    #sections = undefined
    #currentSection = 0 

    // -----------------------------------------------------------------
    //// INITALIZE FUNCTION /////
   

    constructor(name){
        this.sections = Array.from(document.getElementsByClassName("section"))

        document.addEventListener("wheel", this)
        document.addEventListener("pointerdown", this)
        document.addEventListener("keydown", this)
        this.scrollHandler(0)
        document.addEventListener("DOMContentChanged", (()=>{
            // console.log(name,"... goodbye son")
            document.removeEventListener("wheel", this)
            document.removeEventListener("pointerdown", this)
            document.removeEventListener("keydown", this)
        }).bind(this))

        console.log("WTHIDLN!!!", this, name)

    }

    // -----------------------------------------------------------------
    //// SECTION MANIPULATION ////

    //// Singular section manipulation
    toTheTop(index){
        this.sections[index].style.top="-100%"
    }

    toTheCenter(index){
        this.sections[index].style.top="0%"
    }

    toTheBottom(index){
        this.sections[index].style.top="100%"
    }


    //// Group section manipulation
    chunkToTheTop(start, end){
        this.sections.slice(start,end).forEach((element, index) => {
            this.toTheTop(start+index)
        });
    }

    chunkToTheCenter(start, end){
        this.sections.slice(start,end).forEach((element, index)=>{
            this.toTheCenter(start+index)
        })
    }

    chunkToTheBottom(start, end){
        this.sections.slice(start,end).forEach((element, index) => {
            this.toTheBottom(start+index)
        });
    }


    //// SECTION SCROLL HANDLING ////
    // Function to handle what sections appear at which scroll index
    //  - This function is defined by user when calling initalizeScroll()
    #scrollSwitchCase = (section)=>{
        switch (section) {
            default:
                this.scrollSwitchDefaultCase(section)
                break;
        }
    }

    scrollSwitchDefaultCase = (section) =>{
        this.chunkToTheTop(0,section)
        this.chunkToTheCenter(section, section+1)
        this.chunkToTheBottom(section+1)
    }

    // Helper function to scroll to handle scrolling
    //  - Used as a wrapper to scrollSwitchCase()
    //      - Done so that logic for scroll to a specific section index (rather than the global value for currentSection) is common for all scrollSwitchCase()
    //          - aka, don't need to redefine the (albeit) simple logic for each scrollSwitchCase() definiton
    scrollHandler(forcedSection){
        if (forcedSection!= null){
            this.currentSection = forcedSection
        }
        console.log(this.currentSection)
        this.#scrollSwitchCase(this.currentSection)
    }

    setScrollFunction(newSwitchCase){
        if (newSwitchCase){
            this.#scrollSwitchCase = newSwitchCase
            this.scrollHandler(0)
        }
    }

    //// Helper functions used when scrolling
    ////    - Used to limit manipulation on the currentSection value, so it won't go out of range
    #scrollUp(){
        if (this.currentSection >0){
            this.currentSection--
        }
        this.scrollHandler()
    }

    #scrollDown(){
        if (this.currentSection < this.sections.length-1){
            this.currentSection++
        }
        this.scrollHandler()
    }

    // -----------------------------------------------------------------
    //// SCROLL EVENT DEFINITIONS ////
    handleEvent(event){
        switch (event.type) {
            case "wheel":
                this.#scrollWheelEvent(event)
                break;

            case "pointerdown":
                this.#scrollPointerDownEvent(event)
                break;

            case "keydown":
                this.#scrollKeyDownEvent(event)
                break;
        }
    }
    
    // Scroll Wheel Event (Throttle function)
    #scrolledDate = 0
    #scrollWheelEvent (event){
        const date = new Date().getTime()
        if ((date - this.#scrolledDate) > 500){
            if (event.deltaY > 0){
                this.#scrollDown()
            }
            else if (event.deltaY < 0){
                this.#scrollUp()
            }
            this.#scrolledDate = new Date().getTime()
        }
    }

    // Click and Drag Event (For mobile devices)
    #scrollPointerDownEvent(event){
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
                this.#scrollUp()	

            }
            else if (pointerMovePosition < 0){
                this.#scrollDown()

            }

            document.removeEventListener("pointermove", pointerMove)
        },{once:true})
    }

    // Key Down Event (For keyboard based scrolling)
    #scrollKeyDownEvent(event){
        const upPressed = (event.key == "ArrowUp") || (event.key == "PageUp") || (event.key == "Home") || ((event.key == " " && event.shiftKey))
        const downPressed = (event.key == "ArrowDown") || (event.key == "PageDown") || (event.key == "End") || ((event.key == " " && !event.shiftKey))

        if (upPressed){
            this.#scrollUp()
        }
        else if (downPressed){
            this.#scrollDown()
        }
    }
}