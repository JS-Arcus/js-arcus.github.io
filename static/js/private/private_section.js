async function decryptFile(arrayBuffer, key) {
    // --- Helpers ---
    function padKey(key) {
        // Match Python pad_key behavior (assumes 32 bytes / AES-256)
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(key);

        const padded = new Uint8Array(32);
        padded.set(keyBytes.slice(0, 32));
        return padded;
    }

    // --- Extract parts ---
    const data = new Uint8Array(arrayBuffer);

    const iv = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const ciphertext = data.slice(28);

    // WebCrypto expects ciphertext+tag combined
    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext);
    combined.set(tag, ciphertext.length);

    // --- Import key ---
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        padKey(keyString),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    // --- Decrypt ---
    try {
        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            cryptoKey,
            combined
        );

        return decrypted; // ArrayBuffer
    } catch (e) {
        throw new Error("Decryption failed (wrong key or corrupted data)");
    }
}

async function handleFile(file, key) {
    const arrayBuffer = await file.arrayBuffer();
    const decrypted = await decryptFile(arrayBuffer, key);

    // Download result
    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "decrypted_file";
    a.click();
}

let key = "";
async function try_login() {
    let password = document.getElementById("password_input").value;
    const expirationTime = Date.now() + 2 * 60 * 60 * 1000; // 2 Hours
    const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const data = { password: hashedPassword, expiresAt: expirationTime };
    localStorage.setItem("saved_admin_password", JSON.stringify(data));

    console.log("Saved");

    load_data()
}

async function init_privsection() {
    let saved_data = JSON.parse(localStorage.getItem("saved_admin_password"));
    if (saved_data) {
        console.log("password found")
        if (Date.now() > saved_data.expiresAt) {
            console.log("password expired")
            localStorage.removeItem("saved_password");
            password = "";
        } else {
            console.log("password valid")
            password = saved_data.password;
        }
    }
}

async function load_data() {
    fetch("/static/private_section/database.bin")
}

document.addEventListener("DOMContentLoaded", init_privsection);