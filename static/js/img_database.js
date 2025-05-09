let password = ""

async function save_password() {
    let password = document.getElementById("password_input").value;
    const expirationTime = Date.now() + 2 * 60 * 60 * 1000; // 2 Hours
    const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const data = { password: hashedPassword, expiresAt: expirationTime };
    localStorage.setItem("saved_password", JSON.stringify(data));

    load_gallery("")
}

async function decrypt_image(path, key, outputId) {
    const response = await fetch(path);
    const encrypted = new Uint8Array(await response.arrayBuffer());

    const iv = encrypted.slice(0, 12);
    const tag = encrypted.slice(12, 28);
    const ciphertext = encrypted.slice(28);

    const keyBytes = new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

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

    const blob = new Blob([decrypted], { type: "image/jpeg" });
    document.getElementById(outputId).src = URL.createObjectURL(blob);
}


let parent_path = null
function load_gallery(path) {
    const savedData = JSON.parse(localStorage.getItem("saved_password"));

    if (!(path.endsWith("/"))){
        path = path + "/"
    }
    

    if (path == "/"){
        document.getElementById("gallery-back").style.display="none"
    }
    else {
        document.getElementById("gallery-back").style.display="block"
        parent_path = path.split("/").slice(0,path.split("/").length-2).join("/")
        if (parent_path.startsWith("/")){
            parent_path = parent_path.substr(1,parent_path.length)
        }
        document.getElementById("gallery-back").onclick=()=>load_gallery(parent_path)
    }

    if (savedData) {
        if (Date.now() > savedData.expiresAt) {
            localStorage.removeItem("saved_password");
            password = ""
        } else {
            document.getElementById("password_input").value = savedData.password;
            password = savedData.password;
        }
    }

    if (password) {
        document.getElementsByClassName("blocker")[0].hidden = true
        document.getElementById("gallery_container").hidden = false

        fetch("https://raw.githubusercontent.com/JS-Arcus/js-arcus.github.io/refs/heads/main/static/image_database/database.bin")
            .then(response => response.arrayBuffer())
            .then(async encryptedData => {
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

                    const data = JSON.parse(new TextDecoder().decode(decrypted));
                    const gallery = document.getElementById("gallery");
                    gallery.innerHTML = ""; // Clear existing images

                    let struct = data["structure"]

                    path.split("/").forEach(subpath => {
                        if (subpath != "") {
                            struct = struct[subpath]
                        }
                    });
                    
                    Object.keys(struct).forEach(element => {
                        if (typeof struct[element] == "object"){
                            let obj = document.createElement("button")
                            obj.textContent = `${element}`
                            obj.id = `album-button-${element}`
                            obj.onclick = () => load_gallery(`${path}${element}`)
                            obj.className = "album-button"
                            document.getElementById("gallery").appendChild(obj)
                        }
                        else {
                            let obj = document.createElement("img")
                            obj.id = `photo-${element}`
                            document.getElementById("gallery").appendChild(obj)
                            decrypt_image("https://raw.githubusercontent.com/JS-Arcus/js-arcus.github.io/refs/heads/main/static/image_database/"+struct[element].replaceAll(" ","%20"), password, `photo-${element}`)
                        }
                    });


                } catch (error) {
                    if (error.name === "OperationError") {
                        lock_gallery()
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

function init() {
    load_gallery("")
}

window.onload = init