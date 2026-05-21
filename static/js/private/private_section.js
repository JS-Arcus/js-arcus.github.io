let current_path = "";
const listelement = `<div class="filelist_item"><img src="/static/img/ui_icon/{ICON}"><a href="javascript:click_file('{FILEPATH}')">{FILENAME}</a></div>`

function $(selector) {
    return document.querySelector(selector);
}

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
    let p = document.getElementById("password_input").value;
    const expirationTime = Date.now() + 2 * 60 * 60 * 1000; // 2 Hours
    const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(p))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const data = { password: hashedPassword, expiresAt: expirationTime };
    localStorage.setItem("saved_admin_password", JSON.stringify(data));
    password = hashedPassword;
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
            load_data();
            $("#login").classList.add("hidden");
            $("#main").classList.remove("hidden");
        }
    }
}

let data = {};
async function load_data() {
    fetch("/static/private_section/database.bin")
        .then(response => response.arrayBuffer())
        .then(async encryptedData => {
            // if (thisLoadId !== currentGalleryLoadId) return; // Abort if outdated

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

                data = JSON.parse(new TextDecoder().decode(decrypted));
                // data.decrypted = Date.now();
                console.log("Decrypted: ", data);

                $("#login").classList.add("hidden");
                $("#main").classList.remove("hidden");

                render_file_tree();

            } catch (e) {
                console.error(e);
                throw new Error("Decryption failed (wrong key or corrupted data)");
            }

        }
        )
}

function render_file_tree() {
    const parent = $("#doclist");
    let ih = `<i>/${current_path}</i>`;
    // let ih = `<i>/${current_path}</i><br><div class="hline" style="color: #01378b;"></div>`;

    let file_list = ls(current_path);

    file_list.forEach(file => {
        console.log(file);
        let le = listelement.replaceAll("{FILENAME}", file.name);
        if (file.name.endsWith("/")) {
            le = le.replaceAll("{FILEPATH}", file.name);
        }
        else {
            le = le.replaceAll("{FILEPATH}", file.path.encrypted_path);
        }
        console.log(file);
        if (file.name.endsWith("/")) {
            le = le.replaceAll("{ICON}", "folder.svg");
        }
        else {
            le = le.replaceAll("{ICON}", "file_download.svg");
        }

        ih = ih + le;
    });
    parent.innerHTML = ih;
}

function click_file(path) {
    console.log(path);
    if (path == "../") {
        current_path = current_path.split("/").slice(0, current_path.split("/").length - 2).join("/");
        if (!(current_path.endsWith("/") || current_path == "")) {
            current_path = current_path + "/";
        }
        render_file_tree();
    }
    else if (path.endsWith("/")) {
        current_path = current_path + path;
        render_file_tree();
    }
    else {
        download_file(path);
    }
}

// function get_file_info(path) {
//     return data.files[path];
// };

async function download_file(path) {
    fetch(`/static/private_section/${path}`)
        .then(response => response.arrayBuffer())
        .then(async encryptedData => {
            // if (thisLoadId !== currentGalleryLoadId) return; // Abort if outdated

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

                const blob = new Blob([decrypted]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = path.split("/").pop() || "downloaded_file";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

            } catch (e) {
                console.error(e);
                throw new Error("Decryption failed (wrong key or corrupted data)");
            }

        }
        )
}

function ls(dir = "") {
    if (!(dir == "" || dir.endsWith("/"))) {
        console.error("Invalid path for ls");
        return [];
    }

    dir = dir.toLowerCase();
    let dir_split = dir.split("/");
    let name_list = []
    let l = [];
    data.files.forEach(file => {
        path = file.relpath;
        console.log(path);
        let file_dir_split = path.split("/");

        if (path.startsWith(dir)) {
            let cut = path.replace(dir, "");

            let add = cut.split("/")[0];
            if (cut.split("/").length >= 2) {
                add = add + "/";
            }
            if (!name_list.includes(add)) {
                name_list.push(add)
                l.push({ name: add, path: file });
            }
        }
    });
    if (dir != "") {
        l.splice(0, 0, { name: "../", path: { relpath: "../", encrypted_path: "../" } });
    }
    return l;
}

document.addEventListener("DOMContentLoaded", init_privsection);