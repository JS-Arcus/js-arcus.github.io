let password = ""

async function save_password() {
    let password = document.getElementById("password_input").value;
    const expirationTime = Date.now() + 2 * 60 * 60 * 1000; // 2 Hours
    const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const data = { password: hashedPassword, expiresAt: expirationTime };
    localStorage.setItem("saved_password", JSON.stringify(data));

    load_gallery()
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

function load_gallery() {
    const savedData = JSON.parse(localStorage.getItem("saved_password"));

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
                console.log(data)
                const gallery = document.getElementById("gallery");
                gallery.innerHTML = ""; // Clear existing images
                data.forEach(year => {
                    console.log(year);
                });
            })
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
    load_gallery()
    decrypt_image("https://raw.githubusercontent.com/JS-Arcus/js-arcus.github.io/refs/heads/main/static/image_database/gallery/2022/SoLa 22/1.jpg", password, "i1")
}

window.onload = init