const SESSION_EXPIRES_MINUTES = 30;

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
    trackUsers();
    if (!userHasResponded()) {
        document.getElementById("blocker-container").style.display = "block";
        // document.getElementById("modal-background").style.display = "flex";
        document.body.style.overflow = 'hidden';
    }
}

function userHasResponded() {
    var responded = false;

    document.cookie.split(';').forEach(cookie => {
        var parts = cookie.split('=');

        if (parts[0] === 'responded') {
            responded = true;
        }
    });

    return responded;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function setFastCookie(cname, cvalue, minutes = 30) {
    var d = new Date();
    d.setTime(d.getTime() + (minutes*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function trackUsers() {
    console.log(SESSION_EXPIRES_MINUTES);
    const now = new Date();

    const session = getCookie('VISITS_SESSION');
    
    if (session) {
        setFastCookie('VISITS_SESSION', true, SESSION_EXPIRES_MINUTES);
        return;
    }

    setFastCookie('VISITS_SESSION', true, 5);

    const name = `VISITS_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    const actual = getCookie(name);

    const count = actual ? parseInt(actual) + 1 : 1;

    setCookie(name, count, 30);
}