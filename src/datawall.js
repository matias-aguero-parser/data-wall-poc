setTimeout("showModal()", 3000);

function dismissModal() {
    document.getElementById("blocker-container").style.display = "none";
    // document.getElementById("modal-background").style.display = "none";
    document.body.style.overflow = 'scroll';
    var today = new Date();
    var expire = new Date();
    expire.setDate(today.getDate() + 14);
    document.cookie = "responded=true; expires=" + expire.toGMTString();
}

function showModal() {
    if (!userHasResponded()) {
        document.getElementById("blocker-container").style.display = "block";
        // document.getElementById("modal-background").style.display = "flex";
        document.body.style.overflow = 'hidden';
    }
}

function userHasResponded() {
    var cookies = document.cookie;

    cookies.split(';').forEach(cookie => {
        var parts = cookie.split('=');

        if (parts[0] === 'responded') {
            return true;
        }
    });

    return false;
}