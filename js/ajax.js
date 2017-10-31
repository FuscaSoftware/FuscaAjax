/**
 * General JavaScript to Handle Ajax Data, Calls and Responses
 * @author sebastian.braun@fusca.de
 * @version 2.0 (2017-10-31)
 * uses nprogress.js
 * uses jquery
 */

$(document).ajaxStart(function(){
    NProgress.start();
});

$(document).ajaxComplete(function(){
    NProgress.done();
});

$.postJSON = function(url, data, func){
    $.post(url, data, func, 'json');
};

/**
 * @author Sebastian & Philip
 * @param {element or selector} form
 * @returns {getDataObjectByForm.data}
 */
function getDataObjectByForm(form) {
    form = $(form);
    var data = {
        request_type: 'ajax',
        date: new Date().valueOf() /* to avoid request caching */
    };
    /* do not use browser cache */
    if (form.data('nocache') !== undefined && form.data('nocache')) {
        data.date = data.date;
    } else { /* allow browser cache */
        data.date = "";
        // delete data.date;
    }
    if (form.data('additional_fields') !== undefined){
        var container2 = $(form.data('additional_fields'));
        for (var i = 0; i < $(':input', container2).length; i++){
            data[$($(':input', container2)[i]).attr("name")] = $($(':input', container2)[i]).val();
        }
    }
    if (form.data('additional_fields2') !== undefined){
        var container2 = $(form.data('additional_fields2'));
        for (var i = 0; i < $(':input', container2).length; i++){
            data[$($(':input', container2)[i]).attr("name")] = $($(':input', container2)[i]).val();
        }
    }
    if (form.data('limit_from') !== undefined)
        data.limit_from = form.data('limit_from');
    if (form.data('limit_num') !== undefined)
        data.limit_num = form.data('limit_num');
    for (var i = 0; i < $(':input', form).length; i++) {
        if ($($(':input', form)[i]).attr('name') !== undefined)
            data[$($(':input', form)[i]).attr('name')] = $($(':input', form)[i]).val();
    }
    return data;
}

/**
 * Handles an Ajax-Json-Response to modify the client's DOM to change the view.
 * e.g. (server-side) json_encode([html => append [ div.main => "html to append" ]])
 *
 * @param json
 */
function jsonToDom(json){
    if (json.html !== undefined){
        var fadeTime = 400;
        if (json.html.append !== undefined){
            for (var selector in json.html.append){
                var element = $(json.html.append[selector]).hide().fadeIn(fadeTime);
                $(selector).append(element);
            }
        }
        if (json.html.prepend !== undefined){
            for (var selector in json.html.prepend){
                var element = $(json.html.prepend[selector]).hide().fadeIn(fadeTime);
                $(selector).prepend(element);
            }
        }
        if (json.html.html !== undefined){
            for (var selector in json.html.html){
                $(selector).fadeOut(fadeTime);
                $(selector).html(json.html.html[selector]).fadeIn(fadeTime);
            }
        }
        if (json.html.replace !== undefined){
            for (var selectorReplace in json.html.replace){
                replace(selectorReplace, json.html.replace[selectorReplace], fadeTime);
            }
        }
        if (json.html.insertBefore !== undefined){
            for (var selector in json.html.insertBefore){
                $(json.html.insertBefore[selector]).hide().insertBefore(selector).fadeIn(fadeTime);
            }
        }
        if (json.html.insertAfter !== undefined){
            for (var selector in json.html.insertAfter){
                var newEl = $(json.html.insertAfter[selector]).hide();
                newEl.insertAfter(selector).fadeIn(fadeTime);
            }
        }
        if (json.html.remove !== undefined){
            for (var selector in json.html.remove){
                $(selector).remove(selector).fadeOut(fadeTime);
            }
        }
        if (json.html.value !== undefined){
            for (var selector in json.html.value){
                $(selector).val(json.html.value[selector]);
            }
        }
    }
}

/**
 *
 * @param string form or any DOM-Element(-Selector) which can hold inputs which should be send to the server
 * @returns {boolean}
 */
function ajax_submit(form){
    $("body").css("cursor", "progress");
    var url = $(form).attr("action");
    if (url == undefined){
        url = $(form).data("action");
    }
    if (url == undefined){
        url = $(form).attr('href');
    }
    if (url == undefined){
        console.log ("selector/url '"+form+"' invalid");
        return false;
    }
    data = getDataObjectByForm(form);
    return ajax_data(url, data);
}

function ajax_data(url, data){
    return ajax_data2(url, data, null, 0, "ajax");
}
/**
 * requests a url with json-data to server and run success
 * @param string url to request
 * @param object data to send to server
 * @param function success(return/json_from_server)
 * @param int cache if 0 a date is appended
 */
function ajax_data2(url, data, success, cache, request_type) {
    if (data.request_type === undefined && (request_type === undefined))
        data.request_type =  "ajax";
    if (data.date === undefined && (!cache || cache === undefined || cache === 0))
        data.date = new Date().valueOf();//to avoid request caching


    $("body").css("cursor", "progress");
    var doneFn = function (response) {
        if (response instanceof Object)
            var json = response;
        else
            var json = $.parseJSON(response);
        // console.log(response);
        // console.log(json);
        // $('.panel-debug').fadeOut();
        // $('.panel-debug .panel-body .error_messages iframe').contents().find('body').html('');
        jsonToDom(json);
        if (success === undefined || success === null) {
        } else if (typeof success == "function") {
            success(json);
        } else { console.log ("success ist not a valid function" + typeof success); }
        if (json.reload !== undefined && json.reload)
            location.reload();
        if (json.location !== undefined && json.location)
            location.href = json.location;
        $("body").delay(1000).css("cursor", "default");/* trotzdem immer zu früh!? */
    };
    var failFn = function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
        console.log("size of data: " + size);
        // console.log("jqxhr: " + jqxhr);
        // console.log(jqxhr);
        // $('.panel-debug .panel-body .error_messages').html(jqxhr.responseText);
        $('.panel-debug .panel-body .error_messages iframe').contents().find('body').html(jqxhr.responseText);
        $('.panel-debug').fadeIn();
        alert("Fehler!");
    };
    var size = JSON.stringify(data).length;
    if (size > 4096) {
        /* it seems post-requests are not cached by firefox */
        var jqxhr = $.post(url, data, function () {
        }, 'json')
            .done(doneFn)
            .fail(failFn);
    } else {
        var jqxhr = $.get(url, data, function () {
        }, 'json')
            .done(doneFn)
            .fail(failFn);
    }
    return false;
}

function replace(selectorReplace, newHtml, fadeTime){
    // var newEl = $(json.html.replace[selectorReplace]).fadeTo(0, 0.01);
    // $(selectorReplace).fadeTo(fadeTime, 0.01, function(){
    //     newEl.replaceAll(selectorReplace).delay(0).fadeTo(fadeTime, 1);
    // });
    var newEl = $(newHtml).fadeTo(0, 0.01);
    $(selectorReplace).fadeTo(fadeTime, 0.01, function(){
        newEl.replaceAll(selectorReplace).delay(0).fadeTo(fadeTime, 1);
    });
}

/**
 * for testing
 * @param el
 * @param event
 */
function onKeyUp(el, event) {
    console.log(el);
    console.log(event);
    console.log(this);
}

/**
 * Could be used in in input as onKeyUp-Attribute to call the given function
 * @param element
 * @param event
 * @param fn
 * @param params
 * @returns {boolean}
 */
function onEnter(element, event, fn, params) {
    if(event.keyCode === 13) {
        fn(params);
    }
    return false;
}
