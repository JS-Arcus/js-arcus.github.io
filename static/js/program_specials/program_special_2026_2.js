const semester_events = [
    {
        date: "15 Aug 2026 13:30",
        title: "G-Spiel",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "29 Aug 2026 13:30",
        title: "Wiesenspiel & Abend für die Grossen",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "12 Sep 2026 13:30",
        title: "Capture the Flag",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "17 Oct 2026 18:30",
        title: "Nightgame",
        desc: "Infos folgen"
    },
    {
        date: "31 Oct 2026 13:30",
        title: "G-Spiel",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "14 Nov 2026 13:30",
        title: "Herbstnachmittag",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "28 Nov 2026 13:30",
        title: "Huusgame & Abend für die Grossen",
        desc: "13:30-22:00, Reformierte Kirche Bümpliz"
    },
    {
        date: "12 Dec 2026 13:30",
        title: "Waldweihnachten",
        desc: "Infos folgen"
    },
    {
        date: "16 Jan 2027 13:30",
        title: "Schlöfle",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "30 Jan 2027 13:30",
        title: "G-Spiel",
        desc: "13:30, Reformierte Kirche Bümpliz"
    },
    {
        date: "19 Feb 2027 10:00",
        title: "Schliwo 27",
        desc: "Infos folgen"
    }
]


const months = ["Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"];

let content = null



function download_file(file_name, display) {
    const link = document.createElement('a');
    link.href = `static/${file_name}`;
    link.download = file_name;
    if (display) {
        link.download = display;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function download_ical() {
    download_file("semesters/2026-2/ical.ics", "js_arcus_termine_wilder_westen.ics")
}

function download_pdf() {
    download_file("semesters/2026-2/print.pdf", "js_arcus_semesterprogramm_wilder_westen.pdf")
}

let tumbleweeds = [];
const gravity = 0.02;
let canvas = null;
let tumbleweed_image = null;
let gold_image = null;

function spawn_tumble() {
    if (tumbleweed_image == null) { tumbleweed_image = document.querySelector("#tumbleweed_img"); setTimeout(spawn_tumble, 100); return };
    if (gold_image == null) { gold_image = document.querySelector("#gold_img"); setTimeout(spawn_tumble, 100); return };
    let tw = {
        i: tumbleweed_image,
        x: viewport.segments[0].width + 100,
        y: viewport.segments[0].height * Math.random(),
        mx: -1 - (5 * Math.random()),
        my: (Math.random() * 2),
        s: Math.random() / 2 + 0.75,
        r: Math.random() * 2 * Math.PI
    };
    tw["av"] = tw.mx * (Math.random() / 2 + 0.75) / 100;

    if (Math.random() > 0.99) { tw.i = gold_image };

    tumbleweeds.push(tw);
    ticks_since_last_spawn = 0;
}

let ticks_since_last_spawn = 0;
function tumble() {
    if (canvas == null) { canvas = document.querySelector("#tumblecanv") };
    canvas.width = viewport.segments[0].width;
    canvas.height = viewport.segments[0].height;
    let ctx = canvas.getContext("2d");
    tumbleweeds.forEach(tw => {
        if (tw.x < -100 || tw.y > canvas.height) { tumbleweeds.splice(tumbleweeds.indexOf(tw), 1) };
        tw.x += tw.mx;
        tw.y -= tw.my;
        tw.my -= gravity;
        if (tw.my < -1 && Math.random() > 0.8) {
            tw.my *= -1 * (Math.random() + 0.5);
            tw.mx *= Math.random() + 0.5
            tw.av = tw.mx * (Math.random() / 2 + 0.75) / 100
            if (tw.mx > -1) {
                tw.mx -= 1;
            }
        }
        tw.r += tw.av;

        const size = 64 * tw.s;
        ctx.save();
        ctx.translate(tw.x + size / 2, tw.y + size / 2);
        ctx.rotate(tw.r);
        ctx.drawImage(tw.i, -size / 2, -size / 2, size, size);
        ctx.restore();
    });
    ticks_since_last_spawn++;
    if (ticks_since_last_spawn > 100 && Math.random() > 0.99) {
        for (let i = 0; i < Math.ceil(Math.random() * 2); i++) {
            setTimeout(spawn_tumble, Math.random() * 5000);
        }
    };
}

setInterval(tumble, 10);

function populate_events() {
    let parent = document.getElementById("event_container");
    let html = "";
    let dates = [];
    let is_first = true;

    semester_events.forEach((event, i) => {
        let d_obj = new Date(event.date + "");
        let date_string = `${String(d_obj.getDate()).padStart(2, "0")}. ${months[d_obj.getMonth()]} ${d_obj.getFullYear()}`;
        let hidden_if_not_next = "transparent";
        let over_if_over = d_obj - Date.now() < 0 ? "over" : "";

        if (over_if_over === "" && is_first) {
            is_first = false;
            hidden_if_not_next = "";
        }

        html += `
            <div class="x tintable event ${over_if_over}">
                <img style="margin-right: 0;" class="${hidden_if_not_next}" src="/static/img/special/luckyluke.png">
                <div class="tintable nospace_c">
                    <h3 hash_data="${i}">${date_string}</h3>
                    <strong>${event.title}</strong><br>
                    <i>${event.desc}</i><br>
                    <span id="event_${i}_countdown" class="countdown ${hidden_if_not_next}"></span>
                </div>
            </div>
        `;
        dates.push(d_obj);
    });

    parent.innerHTML = html;
    dates.forEach((d_obj, i) => {
        document.getElementById(`event_${i}_countdown`)._targetDate = d_obj;
    });
    scroll_to_hash();
}

document.addEventListener("DOMContentLoaded", populate_events);