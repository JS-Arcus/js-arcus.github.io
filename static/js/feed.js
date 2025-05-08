const feed_url = "https://raw.githubusercontent.com/JS-Arcus/js-arcus-webseite/refs/heads/main/feeds/aktuelles/"

function load_feed(){
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
                lines.splice(0,1)
                interpreted_lines = []
                lines.forEach(line => {
                    if (line.startsWith("Bild: ")){
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

                                    if (url.startsWith("datei:")){
                                        url = feed_url+"dateien/"+url.substring(6,url.length)
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
                let content = "<i>"+date+"</i>\n"+interpreted_lines.join("\n")

                let post_object = document.createElement("div")
                post_object.innerHTML = content
                post_object.className = "blog_post"
                document.getElementById("feed_container").appendChild(post_object)
            });
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
}
window.onload = load_feed