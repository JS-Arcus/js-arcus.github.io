const current_camp = "pfila26";
const next_camp = "pfila26";

function redirect_to_program(){
    let spid = document.location.hash.replaceAll("#","");
    console.log(spid);
    if (spid=="") {spid=current_camp}
    if (spid=="next") {spid=next_camp}
    let a = document.createElement("a");
    a.href = `camps/${spid}.html`;
    a.click();
}

document.addEventListener("DOMContentLoaded", redirect_to_program);