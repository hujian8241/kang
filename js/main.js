$(document).ready(function() {
    
    // init date infos
    var meteos = [];
    for (var i = 0; i <= 7; i++) {
        meteos[getToday('-', i)] = [];
    }
    
    // init time infos
    var time_meteos = [];
    var times = ['02:00:00','05:00:00','08:00:00','11:00:00','14:00:00','17:00:00','20:00:00','23:00:00'];
    times.forEach(function(t) {
        time_meteos[t] = [];
    });

    // ajax infoclimat
    var url = 'https://www.infoclimat.fr/public-api/gfs/json?_ll=48.85341,2.3488&_auth=ABpTRFEvXH5RfFNkVCIGLwRsVWAJfwgvBHhRMgFkBXgGbVMyVTVSNFM9BnsEK1ZgByoObQoxBzcFbgB4CnhXNgBqUz9ROlw7UT5TNlR7Bi0EKlU0CSkILwRmUT8BaAV4BmJTPlUoUjFTOwZgBCpWYwc9DmoKKgcgBWcAYgpgVzUAZVMyUTFcO1E4UzhUewYtBDJVYQlnCGQEb1ExAT8FZwZsUz9VM1I4U24GZAQqVmAHNg5uCjQHPwVhAGUKYFcrAHxTTlFBXCNRflNzVDEGdAQqVWAJaAhk&_c=8f93d33bb8b82f3cc03706c0332babd0';
    $.getJSON(url, function(data){
        if(200 === data['request_state']){
            $.each(data, function(datetime, meteo) {
                if(null !== datetime.match(/^\d{4}[-]\d{1,2}[-]\d{1,2}\s\d{2}[:]\d{2}[:]\d{2}$/)){
                    // date and time split
                    var datetime_split = datetime.split(' ');
                    var date = datetime_split[0];
                    var time = datetime_split[1];

                    // check time in table times
                    if(times.indexOf(time) > -1){
                        meteos[date][time] = meteo;
                    }
                }
            });

            // html body
            var html_today = '';
            var html_week = '';
            var today = getToday('-', 0);
            for (var date in meteos) {
                // html list week
                html_week += getHtmlfixed(meteos, date);
            }
            // html today
            html_today = getHtmlDynamic(meteos[today], today);
            
            $("#week").append('<ul class="meteo-infos" id="meteo-week">' + html_week + '</ul>');
            $("#today").append(html_today);
            
            // click week infos
            $(".day-week").bind( "click", function() {
                $("#today").html("");
                var day_id = $(this).attr('id');
                var date_meteos = meteos[day_id];
                html_today = getHtmlDynamic(date_meteos, day_id);
                $("#today").html(html_today);
            });
        }
    });
});

var getHtmlfixed = function(meteos, date_meteo){
    // html
    var temperature = [];
    var date_meteos = meteos[date_meteo];
    var rain_1 = 0;
    var rain_3 = 0;
    var html_week = '';
    
    for (var time_meteos in date_meteos) {
        if(date_meteos[time_meteos]['pluie'] > 1){
            rain_1++;
        } else if(date_meteos[time_meteos]['pluie'] > 3){
            rain_3++;
        }
        if(date_meteos[time_meteos]['temperature'] !== undefined ){
            temperature.push(date_meteos[time_meteos]['temperature']['sol']);
        }
    }

    // html week
    html_week +=
    '<li class="col-6 col-md-1 text-center day-week" id="' + date_meteo.substr(0,10) + '">'
    + '<span class="temp-day col-12 col-md-12">' + getNameDate(date_meteo).toLowerCase().substr(0,3) + '.' + '</span>'
    + '<i class="col-12 col-md-12 icon wi ' + checkMeteo(rain_1, rain_3) + ' fz50"></i>'
    + '<div class="temp-infos">'
    + '<span class="temp-max font-weight-bold float-left">' + convertKelvinToCelsius(Math.max.apply(null, temperature)) + '°</span>'
    + '<span class="temp-min float-right">' + convertKelvinToCelsius(Math.min.apply(null, temperature)) + '°</span>'
    + '</div>'
    + '</li>';
    
    return html_week;
}

var getHtmlDynamic = function(date_meteos, day){
    // html today
    var rain_1 = 0;
    var rain_3 = 0;
    var html_today = '';
    var temperature = [];
    var html_today_list = '';
    
    // html list
    html_today_list  += '<ul class="meteo-infos" id="meteo-today">';
    for (var time_meteos in date_meteos) {
        if(date_meteos[time_meteos]['pluie'] > 1){
            rain_1++;
        } else if(date_meteos[time_meteos]['pluie'] > 3){
            rain_3++;
        }

        var tmp_sol = 'NAN';
        if(date_meteos[time_meteos]['temperature'] !== undefined ){
            temperature.push(date_meteos[time_meteos]['temperature']['sol']);
            tmp_sol = date_meteos[time_meteos]['temperature']['sol'];
        }

        html_today_list += '<li class="col-6 col-md-1 text-center" id="' + time_meteos.substr(0,2) + '">'
        + '<span class="font-weight-bold">' + convertKelvinToCelsius(tmp_sol) + '°</span>'
        + '<br/>'
        + '<span>' + time_meteos.substr(0,5) + '</span>'
        + '</li>';
    }
    html_today_list += '</ul>';
    
    // html dynamic
    html_today += '<div id="infos-today">'
        + '<span class="col-md-12 col-12 title-today">' + getNameDate(day).toLowerCase() + '</span>'
        + '<i class="col-12 col-md-1 icon wi ' + checkMeteo(rain_1, rain_3) + ' fz50"></i>'
        + '<span class="col-1 font-weight-bold title-degree">' + convertKelvinToCelsius(Math.max.apply(null, temperature)) + '<span class="degree">°C</span></span>'
        + '</div>';

    html_today += html_today_list;
    
    return html_today;
}

var getToday = function(sp, i){
    var today = new Date();
    var dd = today.getDate()+i;
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    return yyyy + sp + mm + sp + dd;
};

var getNameDate = function(date){
    var tabDate=new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
    var parts =date.split('-');
    var ladate = new Date(parts[0], parts[1] - 1, parts[2]);
    return tabDate[ladate.getDay()];
}

var checkMeteo = function(rain_1, rain_3){
    var res = 'wi-day-sunny';
    if(rain_1 > 2){
        res = "wi-day-sleet";
    } else if(rain_3 > 2) {
        res = "wi-day-rain";
    }
    return res;
}

var convertKelvinToCelsius = function(kelvin) {
    if (kelvin < (0)) {
        return 'N';
    } else {
        if(Infinity == kelvin){
            return 'N';
        }
        return Math.round(kelvin-273.15);
    }
}
