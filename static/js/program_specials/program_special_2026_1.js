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
    download_file("semesters/2026-1/ical.ics", "js_arcus_termine_levelup.ics")
}

function download_pdf() {
    download_file("semesters/2026-1/print.pdf", "js_arcus_semesterprogramm_levelup.pdf")
}