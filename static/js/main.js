const obfuscation_chars = "%&/*+{}[]$§°^~=-:|\\<>"

function handle_obfuscation() {
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
    if (objs.length == 0) {
        clearInterval(obfuscation_interval)
    }
}

function handle_countdowns() {
    document.querySelectorAll(".countdown").forEach(ct_el => {
        let id = ct_el.id;
        if (id == null) {
            console.error("Please give every countdown element a unique ID.");
            console.log("Faulty countdown:");
            console.log(ct_el);
        }
        else {
            let targetdate = ct_el._targetDate;
            if (targetdate == null) {
                ct_el.textContent = "Invalid date";
            }
            else {
                let now = new Date();
                let diff = targetdate - now;
                if (diff <= 0) {
                    ct_el.textContent = "00:00";
                }
                else {
                    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    let seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    if (days < 2) {
                        ct_el.textContent =
                            String(hours).padStart(2, '0') + ":" +
                            String(minutes).padStart(2, '0') + ":" +
                            String(seconds).padStart(2, '0');
                    }
                    else {
                        ct_el.textContent =
                            String(days).padStart(2, '0') + " Tage, " +
                            String(hours).padStart(2, '0') + ":" +
                            String(minutes).padStart(2, '0') + ":" +
                            String(seconds).padStart(2, '0');
                    }
                }
            }
        }
    })
}

let obfuscation_interval = null;
let countdown_interval = null;
let map = null;


window.onload = () => {
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

    document.querySelectorAll(".countdown").forEach(ct_el => {
        let id = ct_el.id;
        if (id == null) {
            console.error("Please give every countdown element a unique ID.");
            console.log("Faulty countdown:");
            console.log(ct_el);
        }
        else {
            // parse countdown text (DD.MM.YYYY-HH:MM or DD.MM.YYYY.HH:MM) into a Date and attach to the element
            let txt = ct_el.textContent.trim();
            const re = /^(\d{2})\.(\d{2})\.(\d{4})[.\-](\d{2}):(\d{2})$/;
            const m = txt.match(re);
            if (!m) {
                console.error(`Invalid countdown format for #${id}: "${txt}" — expected DD.MM.YYYY-HH:MM`);
                ct_el._targetDate = null;
                ct_el.dataset.targetIso = "";
            } else {
                const day = parseInt(m[1], 10);
                const month = parseInt(m[2], 10);
                const year = parseInt(m[3], 10);
                const hour = parseInt(m[4], 10);
                const minute = parseInt(m[5], 10);
                const targetDate = new Date(year, month - 1, day, hour, minute, 0, 0); // local time
                ct_el._targetDate = targetDate; // accessible from JS
                ct_el.dataset.targetIso = targetDate.toISOString(); // accessible from HTML/data-attrs
            }
        }
    });

    countdown_interval = setInterval(handle_countdowns, 100);


    document.querySelectorAll(".checklist.save").forEach(cl => {
        let id = cl.id;
        if (id == null) {
            console.error("Please give every checklist a unique ID.");
            console.log("Faulty checklist:");
            console.log(cl);
        }
        else {
            let saved = localStorage.getItem("checklist_" + id);
            if (saved == null) {
                saved = "[]";
            }
            let states = JSON.parse(saved);
            let inputs = cl.querySelectorAll("input[type=checkbox]");
            inputs.forEach((input, index) => {
                if (index < states.length) {
                    input.checked = states[index];
                }
                input.addEventListener("change", () => {
                    let new_states = [];
                    inputs.forEach(inp => {
                        new_states.push(inp.checked);
                    });
                    localStorage.setItem("checklist_" + id, JSON.stringify(new_states));
                });
            });

        }
    });
}

