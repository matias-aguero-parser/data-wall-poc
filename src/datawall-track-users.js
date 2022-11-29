/* ----- CONFIGURATIONS ----- */

// Cookies
const SESSION_EXPIRES_IN_MINUTES = 30;
const COOKIE_PREFIX = 'DATA_WALL';
const COOKIE_ACTIVE_SESSION_NAME = `${COOKIE_PREFIX}_ACTIVE_SESSION`;
const COOKIE_SESSIONS_PREFIX = `${COOKIE_PREFIX}_SESSIONS`;

/* ----- END OF CONFIGURATIONS ----- */

trackUsers();

/**
 * Creates or update a cookie
 * 
 * @param {*} cname Cookie name
 * @param {*} cvalue Cookie value
 * @param {*} minutes Expiration time in days
 */
function setCookieInDays(cname, cvalue, exdays = 30) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Creates or update a cookie
 * 
 * @param {*} cname Cookie name
 * @param {*} cvalue Cookie value
 * @param {*} minutes Expiration time in minutes
 */
function setCookieInMinutes(cname, cvalue, minutes = 30) {
    var d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Gets a specific coockie value
 * 
 * @param {*} cname Cookie name to be retrieved
 * @returns Coockie value
 */
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return;
}

/**
 * Tracks user activity on local cookies
 * 
 * @returns void
 */
function trackUsers() {
    const now = new Date();

    // Validate if the user is still on active session
    const session = getCookie(COOKIE_ACTIVE_SESSION_NAME);
    if (session) {
        // TODO should we renovate the session?
        setCookieInMinutes(COOKIE_ACTIVE_SESSION_NAME, true, SESSION_EXPIRES_IN_MINUTES);
        return;
    }

    // Creates a new user session
    setCookieInMinutes(COOKIE_ACTIVE_SESSION_NAME, true, SESSION_EXPIRES_IN_MINUTES);

    // Get current visit cookie --> PREFIX_YYYY_MM_DD
    const visitCookieName = `${COOKIE_SESSIONS_PREFIX}_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
    const currentVisitCookie = getCookie(visitCookieName);

    // Calculate number of today's visits
    const count = currentVisitCookie ? parseInt(currentVisitCookie) + 1 : 1;

    // Create or update current visit cookie
    setCookieInDays(visitCookieName, count, 30);
}
