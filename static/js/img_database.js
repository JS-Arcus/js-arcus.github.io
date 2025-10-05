let password = ""

let currentGalleryLoadId = 0;

const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            const key = img.dataset.key;
            const loadId = parseInt(img.dataset.loadId);

            // Decrypt and load the image
            decrypt_image(src, key, img.id, loadId);

            // Stop observing once processed
            obs.unobserve(img);
        }
    }
}, {
    // Increase the rootMargin to start loading earlier, e.g., 100% of the viewport height
    rootMargin: `${document.querySelector("body").clientHeight * 2}px`, // Load image twice before it reaches the viewport
    threshold: 0.01  // You can keep this low if you want the image to start loading as soon as it's a little in view
});



async function save_password() {
    console.log("Saved")
    let password = document.getElementById("password_input").value;
    const expirationTime = Date.now() + 2 * 60 * 60 * 1000; // 2 Hours
    const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const data = { password: hashedPassword, expiresAt: expirationTime };
    localStorage.setItem("saved_password", JSON.stringify(data));

    load_gallery("")
}

async function decrypt_image(path, key, outputId, loadId, limit = true) {
    try {
        const response = await fetch(path);
        if (loadId !== currentGalleryLoadId) return; // Cancel if outdated

        const encrypted = new Uint8Array(await response.arrayBuffer());

        const iv = encrypted.slice(0, 12);
        const tag = encrypted.slice(12, 28);
        const ciphertext = encrypted.slice(28);

        const keyBytes = new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        if (loadId !== currentGalleryLoadId) return;

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            "AES-GCM",
            false,
            ["decrypt"]
        );

        if (loadId !== currentGalleryLoadId) return;

        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
                tagLength: 128
            },
            cryptoKey,
            new Uint8Array([...ciphertext, ...tag])
        );

        if (loadId !== currentGalleryLoadId) return; // Cancel just before DOM update

        const blob = new Blob([decrypted], { type: "image/jpeg" });
        if (limit) {
            // Limit resolution to 480p before displaying
            const canvas = document.createElement("canvas");
            const imgBitmap = await createImageBitmap(blob);
            const maxHeight = 480;
            const scale = Math.min(1, maxHeight / imgBitmap.height);
            canvas.width = Math.round(imgBitmap.width * scale);
            canvas.height = Math.round(imgBitmap.height * scale);

            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(resizedBlob => {
                document.getElementById(outputId).src = URL.createObjectURL(resizedBlob);
            }, "image/jpeg");
        }
        else {
            document.getElementById(outputId).src = URL.createObjectURL(blob);
        }
    } catch (error) {
        if (loadId === currentGalleryLoadId) {
            console.error(`Failed to decrypt image ${path}:`, error);
        }
    }
}


let cancel = false

let interval = null

let parent_path = null
async function load_gallery(path, priorityImageId = "") {
    console.log(path)

    clearInterval(interval)
    const thisLoadId = ++currentGalleryLoadId; // Increment to invalidate previous calls
    const savedData = JSON.parse(localStorage.getItem("saved_password"));

    if (!(path.endsWith("/"))) {
        path = path + "/";
    }

    if (path == "/") {
        document.getElementById("gallery-back").style.display = "none";
    } else {
        document.getElementById("gallery-back").style.display = "block";
        let parent_path = path.split("/").slice(0, -2).join("/");
        if (parent_path.startsWith("/")) {
            parent_path = parent_path.substring(1);
        }
        document.getElementById("gallery-back").onclick = () => {
            interval = setInterval(() => load_gallery(parent_path), 100)
            newUrl = `${window.location.pathname}?p=${parent_path}`;
            history.pushState(null, "", newUrl);
        };
    }

    if (savedData) {
        console.log("password found")
        if (Date.now() > savedData.expiresAt) {
            console.log("password expired")
            localStorage.removeItem("saved_password");
            password = "";
        } else {
            console.log("password valid")
            password = savedData.password;
        }
    }

    if (password) {
        document.getElementsByClassName("blocker")[0].hidden = true;
        document.getElementById("gallery_container").hidden = false;

        fetch("https://raw.githubusercontent.com/JS-Arcus/js-arcus.github.io/refs/heads/main/static/image_database/database.bin")
            .then(response => response.arrayBuffer())
            .then(async encryptedData => {
                if (thisLoadId !== currentGalleryLoadId) return; // Abort if outdated

                const iv = new Uint8Array(encryptedData.slice(0, 12));
                const tag = new Uint8Array(encryptedData.slice(12, 28));
                const ciphertext = new Uint8Array(encryptedData.slice(28));

                const keyBytes = new Uint8Array(password.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

                try {
                    const cryptoKey = await crypto.subtle.importKey(
                        "raw",
                        keyBytes,
                        "AES-GCM",
                        false,
                        ["decrypt"]
                    );

                    const decrypted = await crypto.subtle.decrypt(
                        {
                            name: "AES-GCM",
                            iv: iv,
                            tagLength: 128
                        },
                        cryptoKey,
                        new Uint8Array([...ciphertext, ...tag])
                    );

                    if (thisLoadId !== currentGalleryLoadId) return; // Abort if outdated

                    const data = JSON.parse(new TextDecoder().decode(decrypted));
                    const gallery = document.getElementById("gallery");
                    gallery.innerHTML = "";

                    let struct = data["structure"];
                    let title = "";
                    path.split("/").forEach(subpath => {
                        if (subpath !== "") {
                            struct = struct[subpath];
                            title = subpath;
                        }
                    });
                    document.getElementById("current_gallery_title").textContent = title;

                    // Separate albums and images
                    const albums = [];
                    const images = [];
                    Object.keys(struct).forEach(element => {
                        if (typeof struct[element] === "object") {
                            albums.push(element);
                        } else {
                            images.push(element);
                        }
                    });

                    // Sort albums and images
                    albums.sort().reverse();
                    images.sort().reverse();

                    // Add albums first
                    albums.forEach(element => {
                        if (thisLoadId !== currentGalleryLoadId) return; // Stop mid-loop if needed
                        let obj = document.createElement("button");
                        obj.textContent = `${element}`;
                        obj.id = `album-button-${element}`;
                        obj.onclick = () => {
                            load_gallery(`${path}${element}`);
                            let newUrl = `${window.location.pathname}?p=${path}${element}`;
                            history.pushState(null, "", newUrl);
                        };
                        obj.className = "album-button";
                        gallery.appendChild(obj);
                    });

                    // If priorityImageId is set, move it to the front
                    if (priorityImageId) {
                        const idx = images.findIndex(el => `photo-${el}` === priorityImageId);
                        if (idx > -1) {
                            const [priority] = images.splice(idx, 1);
                            images.unshift(priority);
                        }
                    }

                    // Add images
                    images.forEach(element => {
                        if (thisLoadId !== currentGalleryLoadId) return; // Stop mid-loop if needed

                        let obj = document.createElement("img");
                        obj.id = `photo-${element}`;
                        obj.dataset.src =
                            "https://raw.githubusercontent.com/JS-Arcus/js-arcus.github.io/refs/heads/main/static/image_database/" +
                            struct[element].replaceAll(" ", "%20");
                        obj.dataset.key = password;
                        obj.dataset.loadId = thisLoadId;
                        obj.style.minHeight = "100px"; // Optional: reserve space
                        obj.style.background = "#eee"; // Optional: placeholder look
                        obj.onerror = () => obj.remove();
                        obj.onclick = () => {
                            if (obj.src) {
                                document.getElementById("overlay").style.display = "flex";
                                // Decrypt the original photo again, with limit set to false
                                decrypt_image(
                                    obj.dataset.src,
                                    obj.dataset.key,
                                    "big_image",
                                    thisLoadId,
                                    false // Do not limit resolution
                                );
                                // Update URL to reflect the selected image
                                let newUrl = `${window.location.pathname}?p=${path}&i=photo-${element}`;
                                history.pushState(null, "", newUrl);
                            }
                        }
                        gallery.appendChild(obj);
                        observer.observe(obj);
                    });

                } catch (error) {
                    if (thisLoadId !== currentGalleryLoadId) return; // Ignore errors from outdated loads
                    if (error.name === "OperationError") {
                        lock_gallery();
                    } else {
                        console.error("An error occurred:", error);
                    }
                }
            })
            .catch(error => console.error("Failed to fetch or process the data:", error));
    }
}


function lock_gallery() {
    password = ""
    document.getElementsByClassName("blocker")[0].hidden = false
    document.getElementById("gallery_container").hidden = true
    document.getElementById("password_input").value = ""
    localStorage.removeItem("saved_password")
    document.getElementById("gallery").innerHTML = ""
}

function next_image() {
    const params = new URLSearchParams(window.location.search);
    const galleryId = params.get("p") || "";
    const currentImageId = params.get("i") || "header";
    const gallery = document.getElementById("gallery");
    // Only consider images that are loaded (src is set)
    const images = Array.from(gallery.querySelectorAll("img"))
        .filter(img => img.id.startsWith("photo-") && img.src && img.complete && img.naturalWidth > 0);
    if (images.length === 0) return;

    const currentIndex = images.findIndex(img => img.id === currentImageId);
    let nextIndex = 0;
    if (currentIndex !== -1) {
        nextIndex = (currentIndex + 1) % images.length;
    }
    const nextImage = images[nextIndex];
    const nextImageId = nextImage.id;
    const newUrl = `${window.location.pathname}?p=${galleryId}&i=${nextImageId}`;
    history.pushState(null, "", newUrl);

    // Hide overlay and show next image in overlay
    document.getElementById("overlay").style.display = "flex";
    // Decrypt the original photo again, with limit set to false
    decrypt_image(
        nextImage.dataset.src,
        nextImage.dataset.key,
        "big_image",
        parseInt(nextImage.dataset.loadId),
        false // Do not limit resolution
    );
    nextImage.scrollIntoView({ behavior: "smooth" });
}

function prev_image() {
    const params = new URLSearchParams(window.location.search);
    const galleryId = params.get("p") || "";
    const currentImageId = params.get("i") || "header";
    const gallery = document.getElementById("gallery");
    // Only consider images that are loaded (src is set)
    const images = Array.from(gallery.querySelectorAll("img"))
        .filter(img => img.id.startsWith("photo-") && img.src && img.complete && img.naturalWidth > 0);
    if (images.length === 0) return;

    const currentIndex = images.findIndex(img => img.id === currentImageId);
    let prevIndex = images.length - 1;
    if (currentIndex !== -1) {
        prevIndex = (currentIndex - 1 + images.length) % images.length;
    }
    const prevImage = images[prevIndex];
    const prevImageId = prevImage.id;
    const newUrl = `${window.location.pathname}?p=${galleryId}&i=${prevImageId}`;
    history.pushState(null, "", newUrl);

    // Hide overlay and show previous image in overlay
    document.getElementById("overlay").style.display = "flex";
    // Decrypt the original photo again, with limit set to false
    decrypt_image(
        prevImage.dataset.src,
        prevImage.dataset.key,
        "big_image",
        parseInt(prevImage.dataset.loadId),
        false // Do not limit resolution
    );
    prevImage.scrollIntoView({ behavior: "smooth" });
}

function download_image() {
    const params = new URLSearchParams(window.location.search);
    const imageId = params.get("i") || "header";
    const imageElement = document.getElementById(imageId);

    if (imageElement && imageElement.src) {
        const link = document.createElement('a');
        link.href = imageElement.src;
        link.download = imageId.replace("photo-", "") + ".jpg"; // Set the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.warn("Image not found or not loaded yet.");
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

function align() {
    document.getElementById("header").scrollIntoView()
}
setInterval(align, 500)

async function init() {
    const params = new URLSearchParams(window.location.search);
    const galleryId = params.get("p");
    const imageId = params.get("i") || "header";

    await load_gallery(galleryId || "", imageId || "");

    try {

        const targetElement = await waitForElement(imageId);
        targetElement.scrollIntoView({ behavior: "smooth" });
        targetElement.onload = () => targetElement.click()
    } catch (err) {
        console.warn(err.message);
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        const overlay = document.getElementById("overlay");
        if (overlay && overlay.style.display === "flex") {
            overlay.style.display = "none";
        }
        const params = new URLSearchParams(window.location.search);
        params.delete("i");
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        history.replaceState(null, "", newUrl);
    }
    if (event.key === "ArrowRight") {
        next_image();
    }
    if (event.key === "ArrowLeft") {
        prev_image();
    }
});



window.onload = init