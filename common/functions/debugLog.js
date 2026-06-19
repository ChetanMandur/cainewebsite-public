export default function debugLog(toggle){
    if (toggle == undefined){
        console.log = ()=>{}
    }

}