/* ----- CONFIGURATIONS ----- */

const WAIT_TO_LOAD_POPUP_IN_SECONDS = 10;
const POPUP_HTML_ID = 'bc-modal-container';

// Feature Flags - Features can be disabled setting flags to false
const DATA_WALL_FEATURE_FLAG = true;
const DATA_WALL_SUBSCRIBER_FEATURE_FLAG = false;

// Cookies
const SESSION_EXPIRES_IN_MINUTES = 30;
const COUNT_SESSIONS_EXPIRES_IN_DAYS = 30;
const USER_REPLY_EXPIRES_IN_DAYS = 14;

// Decision variables
const BRAND_LOVERS_SESSIONS_QTY = 15;

/* ----- END OF CONFIGURATIONS ----- */

const COOKIE_PREFIX = 'DATA_WALL';
const COOKIE_ACTIVE_SESSION_NAME = `${COOKIE_PREFIX}_ACTIVE_SESSION`;
const COOKIE_SESSIONS_PREFIX = `${COOKIE_PREFIX}_SESSIONS`;
const COOKIE_RESPONSE = `${COOKIE_PREFIX}_RESPONSE`;

evaluateDataWall();

function dismissModal(selection = 'NO') {
    document.getElementById(POPUP_HTML_ID).style.display = "none";
    document.body.style.overflow = 'scroll';

    setCookieInDays(COOKIE_RESPONSE, selection, USER_REPLY_EXPIRES_IN_DAYS);
}

/**
 * Evaluates to show or avoid data wall popup
 */
function evaluateDataWall() {
    trackUsers();

    if (!DATA_WALL_FEATURE_FLAG) {
        // stop here if the flag is disabled
        return;
    }

    if (DATA_WALL_SUBSCRIBER_FEATURE_FLAG && isSubscriberUser()) {
        // do not show popup for subscriber users
        return;
    }

    if (countActiveSession() >= BRAND_LOVERS_SESSIONS_QTY) {
        // if user meet rules, then render data wall popup
        setTimeout("showModal()", WAIT_TO_LOAD_POPUP_IN_SECONDS * 1000);
    }
}

/**
 * Validates if user already paid a subscription
 * 
 * @returns 
 */
function isSubscriberUser() {
    // TODO - TO IMPLEMENT

    return false;
}

function showModal() {
    if (!hasUserResponded()) {
        document.getElementById(POPUP_HTML_ID).style.display = "flex";
        document.body.style.overflow = 'hidden';
    }
}

function hasUserResponded() {
    return getCookie(COOKIE_RESPONSE) ? true : false;
}

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
    setCookieInDays(visitCookieName, count, COUNT_SESSIONS_EXPIRES_IN_DAYS);
}

/**
 * Count number of active sessions
 * 
 * @returns total number of session in the last COUNT_SESSIONS_EXPIRES_IN_DAYS days
 */
function countActiveSession() {
    let count = 0;

    try {
        // get session cookies
        const sessionCookies = document.cookie
            .split(';')
            .filter(cookieString => cookieString.trim().startsWith(COOKIE_SESSIONS_PREFIX));

        // get counts from session cookies
        const sessionValues = sessionCookies.map(x => x.split('=')[1]);

        // count total of session cookies
        count = sessionValues.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue));
    } catch (e) {
        console.log(e);
    }

    return count;
}