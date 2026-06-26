export default class Debug{
    /**@type {boolean} */
    #toggle = false

    /**@type {string} */
    #id = undefined

    /**
     * 
     * @param {boolean} toggle 
     * @param {string} id 
     */
    constructor(toggle, id){
        this.#toggle = toggle
        this.#id = id
    }

    get id(){
        if (this.#id != undefined){
            return this.#id
        }
        else{
            return ""
        }
    }

    /**
     * 
     * @param {any[]} data 
     */
    log(...data){
        if (this.#toggle){
            console.log((`\x1B[3;1;40m`+"("+this.id+")"+`\x1B[m`)+"|",...data)
            // console.log(...data)
        }
    }
}