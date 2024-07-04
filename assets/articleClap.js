/*
    This function - courtesy AWS Fundamentals: Building Serverless Application
    Source - Coursera 
    Requires G_API_GATEWAY_URL_STR in the window object
*/
var
    $button = $("button"),
    $output = $("output"),
    $label = $("label#TWCv6");

/**
 * _askTheFakeBot
 *
 * This is a FAKE CLIENT chatbot
 * It does not hit a backend
 * "regardless of which title you pass",
 * it thinks it is 20 claps
 * 
 * @param String title_str // anything
 * @return To Callback Via Custom Reponse Helper
 * 		//response_str
 */
function _askTheFakeBot(title_str, cb) {
    var
        hard_coded_clap_int = 20,
        response_str = "";
    cb(g_customizeResponse(title_str, hard_coded_clap_int));
}

/**
 * _askTheMockAPIBot
 *
 * This is a API chatbot
 * It DOES hit an API
 * 
 * If you have just wired up the api gateway LAMBDA to
 * DynamoDB
 * then it will return a different clap per title.
 * @param String title_str // 
 * @return To Callback Via Custom Reponse Helper
 * 		//response_str
 */
function _askTheAPIBot(title_str, cb) {
    console.log("We are hitting the API: " + G_API_GATEWAY_URL_STR);
    var
        params = {
            "title_str": title_str
        };
    g_ajaxer(G_API_GATEWAY_URL_STR, params, function (response) {
        handleGatewayResponse(response, title_str, cb);
    }, function (error) {
        handleGatewayError(error, cb);
    });
}

function handleGatewayResponse(response, title_str, cb) {
    var
        clap_int = response.clap_int;
    cb(g_customizeResponse(title_str, clap_int));
}

function handleGatewayError(error, cb) {
    cb("This failed:" + error.statusText);
}
/**
 * _askTheBot
 *
 * Proxy to the right bot
 *  
 * @param String title_str 
 * @param Function //parent_cb
 */
function _pickABot(title_str, cb) {
    if (title_str === "") {
        response_str = "Error missing title";
        return cb(response_str);
    }
    if (G_API_GATEWAY_URL_STR === null) {
        _askTheFakeBot(title_str, cb);
    } else {
        _askTheAPIBot(title_str, cb);
    }
}
/**
 * whatisTheClapCount
 * 
 * @param Submit Event from form
 * @return undefined //UI change on output
 * 
 */
function whatisTheClapCount(se) {
    var
        title_str = "";
    se.preventDefault();
    //if ($button.prop("disabled") === true) {
    //    return;
    //}
    $output.attr("data-showing", "not_showing");
    $button.prop("disabled", "true");
    //alert($label.text)
    title_str = $label.text();

    //title_str = "VIRGINIA";
    _pickABot(title_str, function (response_str) {
        $output.html(response_str);
        $output.attr("data-showing", "showing");
        $button.prop("disabled", false);
    });
}



//handlers
$(document).on("submit", whatisTheClapCount);


/*
Helper functions
*/


/*
    Ensuring data type is set up for CORS
*/
function g_ajaxer(url_str, params, ok_cb, fail_cb) {
    $.ajax({
        url: url_str,
        type: "POST",
        data: JSON.stringify(params),
        crossDomain: true,
        contentType: "application/json",
        dataType: "json",
        success: ok_cb,
        error: fail_cb,
        timeout: 6000
    });
}


function g_customizeResponse(title_str, clap_int) {
    var
        message_str = " " + clap_int.toString() + " claps";
    // message_str += "<br /><br />";

    return message_str;
}