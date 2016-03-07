function requestMapByCountryListenersChartData() {
    initDatepicker(sendMapByCountryListenersRequest);
    sendMapByCountryListenersRequest();
}

var mCurrentMapByCountryResultList = null;

function sendMapByCountryListenersRequest() {
    setHighchartUseUTC(true);
    var range = getDateRange();
    $('#table_country_listeners').fadeOut(1000);
    $.post('/api/listeners/map/country',
        {
            startDate: range[0],
            endDate: range[1],
            mounts: JSON.stringify(getSelectedMounts())
        },
        function (result, textStatus, jqXHR) {
            mCurrentMapByCountryResultList = result;
            var data = {};
            for (var i = 0; i < result.length; i++) {
                var records = result[i].data.Records;
                for (var j = 0; j < records.length; j++) {
                    var record = records[j];
                    var code = record.code;
                    if (data[code]) {
                        data[code] += record.value;
                    } else {
                        data[code] = record.value;
                    }
                }
            }

            var items = [];
            for (var key in data) {
                var item = {};
                if (key.length === 0) item.name = "Other";
                else item.name = key;
                item.value = data[key];
                items.push(item);
            }

            items = items.sort(function(a,b) {
                return b.value - a.value;
            });

            data = [];
            var categories = [];
            for (var k = 0; k < items.length; k++) {
                var citem = items[k];
                if (citem.value >= items[0].value * 0.01) {
                    var countryName = countries[citem.name];
                    if (countryName)
                        categories.push(countryName);
                    else categories.push(citem.name);
                    data.push(citem.value);
                }
            }

            drawMapByCountryListenersChart(data, categories);

            data = prepareFieldsForCountryTable();
            clearTableIfExist('#table_country_listeners');
            loadCountryListenersTable(data);
            $('#table_country_listeners').fadeIn(1000);
        }
    );
}

function prepareFieldsForCountryTable() {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({ title: 'Country', data: 'country' });

    for (var i = 0; i < mCurrentMapByCountryResultList.length; i++) {
        var item = mCurrentMapByCountryResultList[i].mountItem;
        var name = 'total_' + item.mount_id;
        columns.push({ title: item.name, data: name, defaultContent: '' });

        var records = mCurrentMapByCountryResultList[i].data.Records;
        if (dataSet.length === 0) {
            for (var j = 0; j < records.length; j++) {
                var record = records[j];
                var tableItem = {};
                tableItem.code = record.code ? record.code : "Other";
                tableItem.country = countries[record.code] ? countries[record.code] : "Other";
                tableItem[name] = record.value;
                tableItem.total = record.value;
                dataSet.push(tableItem);
            }
        } else {
            for (var k = 0; k < records.length; k++) {
                var column_record = records[k];

                var found = false;
                for (var m = 0; m < dataSet.length; m++) {
                    var code = column_record.code ? column_record.code : "Other";
                    if (dataSet[m].code == code) {
                        dataSet[m][name] = column_record.value;
                        dataSet[m].total += column_record.value;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    var tItem = {};
                    tItem.code = column_record.code ? column_record.code : "Other";
                    tItem.country = countries[column_record.code] ? countries[column_record.code] : "Other";
                    tItem[name] = column_record.value;
                    tItem.total = column_record.value;
                    dataSet.push(tItem);
                }
            }
        }
    }

    if (mCurrentMapByCountryResultList.length > 1)
        columns.push({ title: 'Total', data: 'total' });

    result.columns = columns;
    result.dataSet = dataSet;
    return result;

}

function loadCountryListenersTable(result) {
    var table = $('#table_country_listeners').DataTable({
        "order": [[ result.columns.length - 1, "desc" ]],
        data: result.dataSet,
        columns: result.columns,
        dom: domDefault(),
        buttons: dtButtons('CountryListeners')
    });

    dtAssignButtons(table);
}

function getMountsInfoByCountryCode(code) {
    var data = {};
    for (var i = 0; i < mCurrentMapByCountryResultList.length; i++) {
        var name = mCurrentMapByCountryResultList[i].mountItem.name;
        var records = mCurrentMapByCountryResultList[i].data.Records;
        for (var j = 0; j < records.length; j++) {
            var record = records[j];
            if (code == record.code) {
                data[name] = record.value;
            }
        }
    }
    return data;
}

function drawMapByCountryListenersChart(data, categories) {
    Highcharts.setOptions({
        lang: {
            decimalPoint: ',',
            thousandsSep: ' '
        }
    });
    $('#chart_map_by_country_listeners').highcharts({
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Listeners by Country'
        },
        xAxis: {
            categories: categories,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: null
            },
            labels: {
                overflow: 'justify'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            enabled: false,
        },
        series: [{
            name: 'Listeners',
            data: data
        }]
    });
}

var countries = {
	"AF": "Afghanistan",
	"AL": "Albania",
	"DZ": "Algeria",
	"AS": "American Samoa",
	"AD": "Andorra",
	"AO": "Angola",
	"AI": "Anguilla",
	"AQ": "Antarctica",
	"AG": "Antigua and Barbuda",
	"AR": "Argentina",
	"AM": "Armenia",
	"AW": "Aruba",
	"AU": "Australia",
	"AT": "Austria",
	"AZ": "Azerbaijan",
	"BS": "Bahamas",
	"BH": "Bahrain",
	"BD": "Bangladesh",
	"BB": "Barbados",
	"BY": "Belarus",
	"BE": "Belgium",
	"BZ": "Belize",
	"BJ": "Benin",
	"BM": "Bermuda",
	"BT": "Bhutan",
	"BO": "Bolivia",
	"BA": "Bosnia and Herzegovina",
	"BW": "Botswana",
	"BV": "Bouvet Island",
	"BR": "Brazil",
	"IO": "British Indian Ocean Territory",
	"BN": "Brunei Darussalam",
	"BG": "Bulgaria",
	"BF": "Burkina Faso",
	"BI": "Burundi",
	"KH": "Cambodia",
	"CM": "Cameroon",
	"CA": "Canada",
	"CV": "Cape Verde",
	"KY": "Cayman Islands",
	"CF": "Central African Republic",
	"TD": "Chad",
	"CL": "Chile",
	"CN": "China",
	"CX": "Christmas Island",
	"CC": "Cocos (Keeling) Islands",
	"CO": "Colombia",
	"KM": "Comoros",
	"CG": "Congo",
	"CD": "Congo (Democratic Republic)",
	"CK": "Cook Islands",
	"CR": "Costa Rica",
	"CI": "Cote D'Ivoire",
	"HR": "Croatia",
	"CU": "Cuba",
	"CY": "Cyprus",
	"CZ": "Czech Republic",
	"DK": "Denmark",
	"DJ": "Djibouti",
	"DM": "Dominica",
	"DO": "Dominican Republic",
	"EC": "Ecuador",
	"EG": "Egypt",
	"SV": "El Salvador",
	"GQ": "Equatorial Guinea",
	"ER": "Eritrea",
	"EE": "Estonia",
	"ET": "Ethiopia",
	"FK": "Falkland Islands (Malvinas)",
	"FO": "Faroe Islands",
	"FJ": "Fiji",
	"FI": "Finland",
	"FR": "France",
	"GF": "French Guiana",
	"PF": "French Polynesia",
	"TF": "French Southern Territories",
	"GA": "Gabon",
	"GM": "Gambia",
	"GE": "Georgia",
	"DE": "Germany",
	"GH": "Ghana",
	"GI": "Gibraltar",
	"GR": "Greece",
	"GL": "Greenland",
	"GD": "Grenada",
	"GP": "Guadeloupe",
	"GU": "Guam",
	"GT": "Guatemala",
	"GN": "Guinea",
	"GW": "Guinea-Bissau",
	"GY": "Guyana",
	"HT": "Haiti",
	"HM": "Heard Island and Mcdonald Islands",
	"VA": "Holy See (Vatican City State)",
	"HN": "Honduras",
	"HK": "Hong Kong",
	"HU": "Hungary",
	"IS": "Iceland",
	"IN": "India",
	"ID": "Indonesia",
	"IR": "Iran",
	"IQ": "Iraq",
	"IE": "Ireland",
	"IL": "Israel",
	"IT": "Italy",
	"JM": "Jamaica",
	"JP": "Japan",
	"JO": "Jordan",
	"KZ": "Kazakhstan",
	"KE": "Kenya",
	"KI": "Kiribati",
	"KP": "Korea (Democratic Republic)",
	"KR": "Korea",
	"KW": "Kuwait",
	"KG": "Kyrgyzstan",
	"LA": "Lao",
	"LV": "Latvia",
	"LB": "Lebanon",
	"LS": "Lesotho",
	"LR": "Liberia",
	"LY": "Libyan Arab Jamahiriya",
	"LI": "Liechtenstein",
	"LT": "Lithuania",
	"LU": "Luxembourg",
	"MO": "Macao",
	"MK": "Macedonia",
	"MG": "Madagascar",
	"MW": "Malawi",
	"MY": "Malaysia",
	"MV": "Maldives",
	"ML": "Mali",
	"MT": "Malta",
	"MH": "Marshall Islands",
	"MQ": "Martinique",
	"MR": "Mauritania",
	"MU": "Mauritius",
	"YT": "Mayotte",
	"MX": "Mexico",
	"FM": "Micronesia",
	"MD": "Moldova",
	"MC": "Monaco",
	"MN": "Mongolia",
	"MS": "Montserrat",
	"MA": "Morocco",
	"MZ": "Mozambique",
	"MM": "Myanmar",
	"NA": "Namibia",
	"NR": "Nauru",
	"NP": "Nepal",
	"NL": "Netherlands",
	"NC": "New Caledonia",
	"NZ": "New Zealand",
	"NI": "Nicaragua",
	"NE": "Niger",
	"NG": "Nigeria",
	"NU": "Niue",
	"NF": "Norfolk Island",
	"MP": "Northern Mariana Islands",
	"NO": "Norway",
	"OM": "Oman",
	"PK": "Pakistan",
	"PW": "Palau",
	"PS": "Palestinian Territory, Occupied",
	"PA": "Panama",
	"PG": "Papua New Guinea",
	"PY": "Paraguay",
	"PE": "Peru",
	"PH": "Philippines",
	"PN": "Pitcairn",
	"PL": "Poland",
	"PT": "Portugal",
	"PR": "Puerto Rico",
	"QA": "Qatar",
	"RE": "Reunion",
	"RO": "Romania",
	"RU": "Russia",
	"RW": "Rwanda",
	"SH": "Saint Helena",
	"KN": "Saint Kitts and Nevis",
	"LC": "Saint Lucia",
	"PM": "Saint Pierre and Miquelon",
	"VC": "Saint Vincent and the Grenadines",
	"WS": "Samoa",
	"SM": "San Marino",
	"ST": "Sao Tome and Principe",
	"SA": "Saudi Arabia",
	"SN": "Senegal",
	"SC": "Seychelles",
	"SL": "Sierra Leone",
	"SG": "Singapore",
	"SK": "Slovakia",
	"SI": "Slovenia",
	"SB": "Solomon Islands",
	"SO": "Somalia",
	"ZA": "South Africa",
	"GS": "South Georgia and the South Sandwich Islands",
	"ES": "Spain",
	"LK": "Sri Lanka",
	"SD": "Sudan",
	"SR": "Suriname",
	"SJ": "Svalbard and Jan Mayen",
	"SZ": "Swaziland",
	"SE": "Sweden",
	"CH": "Switzerland",
	"SY": "Syrian Arab Republic",
	"TW": "Taiwan",
	"TJ": "Tajikistan",
	"TZ": "Tanzania",
	"TH": "Thailand",
	"TL": "Timor-Leste",
	"TG": "Togo",
	"TK": "Tokelau",
	"TO": "Tonga",
	"TT": "Trinidad and Tobago",
	"TN": "Tunisia",
	"TR": "Turkey",
	"TM": "Turkmenistan",
	"TC": "Turks and Caicos Islands",
	"TV": "Tuvalu",
	"UG": "Uganda",
	"UA": "Ukraine",
	"AE": "United Arab Emirates",
	"GB": "United Kingdom",
	"US": "United States",
	"UM": "United States Minor Outlying Islands",
	"UY": "Uruguay",
	"UZ": "Uzbekistan",
	"VU": "Vanuatu",
	"VE": "Venezuela",
	"VN": "Viet Nam",
	"VG": "Virgin Islands, British",
	"VI": "Virgin Islands, U.s.",
	"WF": "Wallis and Futuna",
	"EH": "Western Sahara",
	"YE": "Yemen",
	"ZM": "Zambia",
	"ZW": "Zimbabwe",
	"AX": "Åland Islands",
	"BQ": "Bonaire",
	"CW": "Curaçao",
	"GG": "Guernsey",
	"IM": "Isle of Man",
	"JE": "Jersey",
	"ME": "Montenegro",
	"BL": "Saint Barthélemy",
	"MF": "Saint Martin (French part)",
	"RS": "Serbia",
	"SX": "Sint Maarten (Dutch part)",
	"SS": "South Sudan"
};
