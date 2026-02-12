function redirect_to_program(){
    let spid = document.location.hash.replaceAll("#","");
    console.log(spid);
    if (spid=="") {spid="2026-1"}
    if (spid=="next") {spid="2026-2"}
    let a = document.createElement("a");
    a.href = `program_${spid}.html`;
    a.click();
}

document.addEventListener("DOMContentLoaded", redirect_to_program);