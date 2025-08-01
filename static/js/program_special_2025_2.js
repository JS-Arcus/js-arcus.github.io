let content = null

function update_color() {
    const scrollTop = content.scrollTop;
    const docHeight = content.scrollHeight - content.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;
    const colorMod = scrollPercent

    let r = 0 + 30;
    let g = Math.round(colorMod * 20) + 30;
    let b = Math.round(colorMod * 70) + 30;
    console.log(r, g, b)
    for (let object of document.querySelectorAll("div")) {
        object.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
    for (let object of document.querySelectorAll("p, strong, h1, h2, h3, i, a, span, img")) {
        object.style.backgroundColor = "transparent"
    }
    document.getElementById("content").style.backgroundColor = `transparent`;
}

window.addEventListener('DOMContentLoaded', () => {
    content = document.getElementById('content');
    content.onscroll = update_color;
    update_color()
});

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
    download_file("semesters/2025-2/ical.ics", "js_arcus_termine_levelup.ics")
}

function download_pdf() {
    download_file("semesters/2025-2/print.pdf", "js_arcus_semesterprogramm_levelup.pdf")
}