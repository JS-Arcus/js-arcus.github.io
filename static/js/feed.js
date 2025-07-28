const feed_url = "https://raw.githubusercontent.com/JS-Arcus/js-arcus-webseite/refs/heads/main/feeds/aktuelles/"

let focus_object = null
function load_feed() {
    fetch(feed_url + "feed.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            let posts = data.split("===\n")
            document.getElementById("feed_container").innerHTML = ""
            posts.forEach(post => {
                let lines = post.split("\n")
                let date = lines[0]
                lines.splice(0, 1)
                interpreted_lines = []
                lines.forEach(line => {
                    if (line.startsWith("Bild: ")) {
                        let image_url = line.substring(6, line.length)
                        interpreted_lines.push(`<img src="${feed_url}dateien/${image_url}">`)
                    }
                    else {
                        new_line = ""
                        for (let i = 0; i < line.length; i++) {
                            if (line[i] === "[") {
                                let endBracket = line.indexOf("]", i);
                                if (endBracket !== -1) {
                                    let link_content = line.substring(i + 1, endBracket);

                                    let url = link_content.split(" | ")[0]
                                    let text = link_content.split(" | ")[1]

                                    if (url.startsWith("datei:")) {
                                        url = feed_url + "dateien/" + url.substring(6, url.length)
                                    }

                                    let link = `<a href="${url}">${text}</a>`

                                    new_line += link

                                    i = endBracket; // Skip to the end of the current bracket
                                }
                                else {
                                    new_line += line[i]
                                }
                            }
                            else {
                                new_line += line[i]
                            }
                        }
                        line = new_line

                        // Example link: [{https://sossinaydev.github.io} My link text]

                        line = line.replaceAll(" *", " <strong>")
                        line = line.replaceAll("*", "</strong>")
                        line = line.replaceAll(" ~", " <i>")
                        line = line.replaceAll("~", "</i>")
                        interpreted_lines.push(`<p>${line}</p>`)
                    }
                });
                let content = "<i>" + date + "</i><br>" + interpreted_lines.join("<br>")

                let post_object = document.createElement("div")
                post_object.innerHTML = content
                post_object.className = "blog_post"
                document.getElementById("feed_container").appendChild(post_object)

                if (date.toLowerCase() === focus_date.toLowerCase().replaceAll("_", " ")) {
                    focus_object = post_object
                }

            });
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

let focus_date = decodeURIComponent(window.location.hash.substring(1));
console.log(window.location.hash)
window.onload = load_feed

let images = []
async function waitForImagesToLoad(container, callback) {
    images = container.querySelectorAll("img");
    let loadedCount = 0;

    if (images.length === 0) {
        callback();
        return;
    }

    images.forEach(img => {
        if (img.complete) {
            loadedCount++;
            if (loadedCount === images.length) callback();
        } else {
            img.onload = img.onerror = () => {
                loadedCount++;
                if (loadedCount === images.length) callback();
            };
        }
    });
}

async function waitForElement(id, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const intervalTime = 100;
        let elapsed = 0;

        const interval = setInterval(() => {
            const el = document.querySelector(id);
            if (el) {
                clearInterval(interval);
                resolve(el);
            } else if (elapsed >= timeout) {
                clearInterval(interval);
                reject(new Error(`Element with ID "${id}" not found after ${timeout}ms`));
            }
            elapsed += intervalTime;
        }, intervalTime);
    });
}

async function init() {
    if (focus_date != "") {
        await waitForElement("#feed_container", timeout = Infinity)
        await waitForElement("#feed_container *.blog_post", timeout = Infinity)
        console.log("container found")

        waitForImagesToLoad(document.getElementById("feed_container"), () => {
            if (focus_object) {
                focus_object.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            else {
                console.log("no focus element")
            }
        })
    }
}

init()