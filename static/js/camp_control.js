function redirect_to_program(){
    let spid = document.location.hash.replaceAll("#","");
    console.log(spid);
    if (spid=="") {spid="schliwo26"}
    if (spid=="next") {spid="pfila26"}
    let a = document.createElement("a");
    a.href = `camps/${spid}.html`;
    a.click();
}

document.addEventListener("DOMContentLoaded", redirect_to_program);