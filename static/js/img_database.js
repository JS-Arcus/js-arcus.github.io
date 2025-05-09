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

    const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));

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
        document.getElementsByClassName("blocker")[0].hidden=true
        document.getElementById("gallery_container").hidden=false

        fetch("static/image_database/database.bin")
            .then(response => response.arrayBuffer())
            .then(async encryptedData => {
            const iv = new Uint8Array(encryptedData.slice(0, 12));
            const tag = new Uint8Array(encryptedData.slice(12, 28));
            const ciphertext = new Uint8Array(encryptedData.slice(28));

            const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));

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

            const years = JSON.parse(new TextDecoder().decode(decrypted));

            const gallery = document.getElementById("gallery");
            gallery.innerHTML = ""; // Clear existing images
            years.forEach(year => {
                console.log(year);
            });
            })
            .catch(error => console.error("Error loading or decrypting image database:", error));
    }
}

function lock_gallery(){
    password=""
    document.getElementsByClassName("blocker")[0].hidden=false
    document.getElementById("gallery_container").hidden=true
    document.getElementById("password_input").value = ""
    localStorage.removeItem("saved_password")
    document.getElementById("gallery").innerHTML = ""
}

function init(){
    load_gallery()
}

window.onload = init