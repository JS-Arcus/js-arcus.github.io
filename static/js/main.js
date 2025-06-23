const obfuscation_chars = "%&/*+{}[]$§°^~=-:|\\<>"

function handle_obfuscation(){
    let objs = document.querySelectorAll(".obfuscated")
    objs.forEach(Object => {
        let leng = Object.textContent.length
        let result = ""
        for (let i = 0; i < leng; i++) {
            let random_char = obfuscation_chars[Math.floor(Math.random() * obfuscation_chars.length)];
            result += random_char
        }
        Object.textContent = result;
    });
    if (objs.length == 0){
        clearInterval(obfuscation_interval)
    }
}

let obfuscation_interval = null

window.onload = ()=>{
    obfuscation_interval = setInterval(handle_obfuscation, 10)
}