const api_base = "https://raw.githubusercontent.com/JS-Arcus/js-arcus.github.io/refs/heads/main/feeds/leiter/";

async function create_person(id) {
    try {
        const response = await fetch(api_base + id + ".txt");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const text = await response.text();
        console.log(text)
        const data = text.split("\n");

        const container = document.createElement("div");
        container.id = id
        container.className = "leiter";

        const header = document.createElement("h2");
        header.textContent = data[0];
        container.appendChild(header);

        const horizontal = document.createElement("div");
        horizontal.className = "leiter_horizontal";

        const image_container = document.createElement("div");
        image_container.className = "leiter_bild";

        const image = document.createElement("img");
        image.src = "static/img/leiter/" + id + ".jpg";
        image.alt = data[0] + " Bild";
        image_container.appendChild(image);
        horizontal.appendChild(image_container);

        const info_container = document.createElement("div");
        info_container.className = "leiter_info";

        const labels = ["Name", "Geburtsjahr", "Beruf", "Hobbies", "Ausbildungen"];
        for (let i = 0; i < labels.length; i++) {
            const p = document.createElement("p");

            const strong = document.createElement("strong");
            strong.textContent = labels[i] + ": ";

            const span = document.createElement("span");
            span.textContent = data[i + 1] || "";

            p.appendChild(strong);
            p.appendChild(span);
            info_container.appendChild(p);
        }

        const p = document.createElement("p");

        const strong = document.createElement("strong");
        strong.textContent = "Hesch gwüsst ";

        const span = document.createElement("span");
        span.textContent = data[6].replace("Hesch gwüsst ", "") || "";

        p.appendChild(strong);
        p.appendChild(span);
        info_container.appendChild(p);

        horizontal.appendChild(info_container);
        container.appendChild(horizontal);

        document.querySelector(".leiter_liste").appendChild(container);

    } catch (error) {
        console.error("Error fetching or displaying person data:", error);
    }
}

async function waitForElement(id, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const intervalTime = 100;
        let elapsed = 0;

        const interval = setInterval(() => {
            const el = document.getElementById(id);
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

async function load_people(scroll_to) {
    const response = await fetch(api_base + "liste.txt");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    text = await response.text()

    await text.split("\n").forEach(person => {
        if (!(person == "")) {
            create_person(person)
        }
    });
    if (await waitForElement(scroll_to)) {
        document.getElementById(scroll_to).scrollIntoView({ behavior: "smooth" })
    }
}

async function init() {
    load_people(document.location.href.split("#")[1] || "")
}

window.onload = init