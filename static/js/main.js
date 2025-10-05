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
let map = null


window.onload = ()=>{
    obfuscation_interval = setInterval(handle_obfuscation, 10)

    map = L.map('location_map').setView([46.940629514276154, 7.392745334483644], 17);
    // Add OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);
    // Add marker
    const myIcon = L.icon({
        iconUrl: 'https://js-arcus.github.io/static/img/js_arcus_logo.png',
        iconSize: [25, 25], // size of the icon
        iconAnchor: [15, 15], // point of the icon which corresponds to the marker's location
        popupAnchor: [0, -13], // point where the popup opens relative to the iconAnchor
    });
    L.marker([46.94069910339558, 7.392667550419796], { icon: myIcon }).addTo(map)
    map.invalidateSize();
}