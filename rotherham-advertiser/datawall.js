/* ----- CONFIGURATIONS ----- */

const WAIT_TO_LOAD_POPUP_IN_SECONDS = 15;
const POPUP_HTML_ID = 'ra-modal-container';
const POPUP_MAIN_TEXT_ID = 'datawall-main-text';
const POPUP_MAIN_TEXT_2ND_WORDING = 'In order to sustain our future we may have to begin charging for some of our content. Would you be prepared to pay for this type of content?';

// Feature Flags - Features can be disabled setting flags to false
const DATA_WALL_FEATURE_FLAG = true;
const DATA_WALL_SUBSCRIBER_FEATURE_FLAG = false;

// Cookies
const SESSION_EXPIRES_IN_MINUTES = 30;
const COUNT_SESSIONS_EXPIRES_IN_DAYS = 30;
const USER_REPLY_EXPIRES_IN_DAYS = 30;
const BRAND_LOVERS_PAGE_VIEWS_EXPIRE_IN_DAYS = 7;

// Brand Lovers - Decision variables
const BRAND_LOVERS_SESSIONS_QTY = 15;
const BRAND_LOVERS_PAGE_VIEWS_MIN_QTY = 3;
const BRAND_LOVERS_PAGE_VIEWS_2ND_WORDING_QTY = 10;

/* ----- END OF CONFIGURATIONS ----- */

const COOKIE_PREFIX = 'DATA_WALL';
const COOKIE_ACTIVE_SESSION_NAME = `${COOKIE_PREFIX}_ACTIVE_SESSION`;
const COOKIE_SESSIONS_PREFIX = `${COOKIE_PREFIX}_SESSIONS`;
const COOKIE_BRAND_LOVERS_PAGE_VIEWS = `${COOKIE_PREFIX}_BRAND_LOVERS_PAGE_VIEWS`;
const COOKIE_RESPONSE = `${COOKIE_PREFIX}_RESPONSE`;
const COOKIE_2ND_RESPONSE = `${COOKIE_PREFIX}_2ND_RESPONSE`;

trackUsers();
setTimeout("evaluateDataWall()", WAIT_TO_LOAD_POPUP_IN_SECONDS * 1000);

function dismissModal(selection = 'NO') {
    document.getElementById(POPUP_HTML_ID).style.display = "none";
    document.body.style.overflow = 'scroll';

    const response = getCookie(COOKIE_RESPONSE);
    if (response) {
        setCookieInDays(COOKIE_2ND_RESPONSE, selection, USER_REPLY_EXPIRES_IN_DAYS);
        setCookieInDays(COOKIE_RESPONSE, response, USER_REPLY_EXPIRES_IN_DAYS);
    } else {
        setCookieInDays(COOKIE_RESPONSE, selection, USER_REPLY_EXPIRES_IN_DAYS);
    }
}

/**
 * Evaluates to show or avoid data wall popup
 */
function evaluateDataWall() {
    if (!DATA_WALL_FEATURE_FLAG) {
        // stop here if the flag is disabled
        return;
    }

    if (DATA_WALL_SUBSCRIBER_FEATURE_FLAG && isSubscriberUser()) {
        // do not show popup for subscriber users
        return;
    }

    const response = getCookie(COOKIE_RESPONSE);
    const secondResponse = getCookie(COOKIE_2ND_RESPONSE);
    if (response === 'YES' || secondResponse) {
        // do not show popup
        return;
    }

    if (countActiveSession() >= BRAND_LOVERS_SESSIONS_QTY) {
        // count page views only if user is a brand lover
        const brandLoverPageViewsQty = countBrandLoverPageViews();

        // after X number of views and if user have replied NO, then show the popup again with different wording
        if (response === 'NO' && brandLoverPageViewsQty >= BRAND_LOVERS_PAGE_VIEWS_2ND_WORDING_QTY) {
            replacePopUpTextBy2ndWording();
            showModal();
            return;
        }
        
        // if no answer and page views reach minumun, then show the popup
        if (!response && brandLoverPageViewsQty >= BRAND_LOVERS_PAGE_VIEWS_MIN_QTY) {
            showModal();
        }
    }
}

/**
 * Replace popup text by a another wording
 */
function replacePopUpTextBy2ndWording() {
    document.getElementById(POPUP_MAIN_TEXT_ID).innerHTML = POPUP_MAIN_TEXT_2ND_WORDING;
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

/**
 * Make PopUp to be visible
 */
function showModal() {
    document.getElementById(POPUP_HTML_ID).style.display = "flex";
    document.body.style.overflow = 'hidden';
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

    // if user is a Brand Lover, then track page views
    if (countActiveSession() >= BRAND_LOVERS_SESSIONS_QTY) {
        let pageViews = parseInt(getCookie(COOKIE_BRAND_LOVERS_PAGE_VIEWS) || 0);
        pageViews++;
        setCookieInDays(COOKIE_BRAND_LOVERS_PAGE_VIEWS, pageViews, BRAND_LOVERS_PAGE_VIEWS_EXPIRE_IN_DAYS);
    }

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

/**
 * Count number of page views when the user is a brand lover
 * 
 * @returns total number of page views
 */
 function countBrandLoverPageViews() {
    let count = 0;

    try {
        count = parseInt(getCookie(COOKIE_BRAND_LOVERS_PAGE_VIEWS) || 0);
    } catch (e) {
        console.log(e);
    }

    return count;
}
