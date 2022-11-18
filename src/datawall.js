setTimeout("showModal()", 3000);

function dismissModal() {
    document.getElementById("blocker-container").style.display = "none";
    // document.getElementById("modal-background").style.display = "none";
    document.body.style.overflow = 'scroll';
}

function showModal() {
    document.getElementById("blocker-container").style.display = "block";
    // document.getElementById("modal-background").style.display = "flex";
    document.body.style.overflow = 'hidden';
}