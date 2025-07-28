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