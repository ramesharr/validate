var validate = (function($) {
    // Private variables
    var email_env_setter,
        isEmailValid,
        isNameValid,
        isPhoneValid,
        briteVerifyStatus = {},
        stateCodes = [205,251,659,256,334,907,403,780,264,268,520,928,480,602,623,501,479,870,242,246,441,250,604,778,284,341,442,628,657,669,747,752,764,951,209,559,408,831,510,213,310,424,323,562,707,369,627,530,714,949,626,909,916,760,619,858,935,818,415,925,661,805,650,600,809,345,670,211,720,970,303,719,203,475,860,959,302,411,202,767,911,239,386,689,754,941,954,561,407,727,352,904,850,786,863,305,321,813,470,478,770,678,404,706,912,229,710,473,671,808,208,312,773,630,847,708,815,224,331,464,872,217,618,309,260,317,219,765,812,563,641,515,319,712,876,620,785,913,316,270,859,606,502,225,337,985,504,318,318,204,227,240,443,667,410,301,339,351,774,781,857,978,508,617,413,231,269,989,734,517,313,810,248,278,586,679,947,906,616,320,612,763,952,218,507,651,228,601,557,573,636,660,975,314,816,417,664,406,402,308,775,702,506,603,551,848,862,732,908,201,973,609,856,505,575,585,845,917,516,212,646,315,518,347,718,607,914,631,716,709,252,336,828,910,980,984,919,704,701,283,380,567,216,614,937,330,234,440,419,740,513,580,918,405,905,289,647,705,807,613,519,416,503,541,971,445,610,835,878,484,717,570,412,215,267,814,724,902,787,939,438,450,819,418,514,401,306,803,843,864,605,869,758,784,731,865,931,423,615,901,325,361,430,432,469,682,737,979,214,972,254,940,713,281,832,956,817,806,903,210,830,409,936,512,915,868,649,340,385,435,801,802,276,434,540,571,757,703,804,509,206,425,253,360,564,304,262,920,414,715,608,307,867],
        months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
        daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

    var regexPatterns = {
        email: new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i),
        name: new RegExp(/^[- a-zA-Z\']+$/),
        phone: new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/),
        dob: new RegExp(/^[0-9/]+$/),
        address: new RegExp(/^[ a-zA-Z0-9!@#$:;&()`.+,/\-"]*$/),
        city: new RegExp(/^[\\sa-zA-Z]*$/),
        zip: new RegExp(/^\d{5}$/)
    };

    if (window.location.protocol == "https:") {
        email_env_setter = "https://api.astrazeneca.com/v1/verifyemail?apikey=a3c758c3-115f-435a-99a5-7faaf6e77297";
    } else {
        email_env_setter = "https://apiuat.astrazeneca.com/v1/verifyemail?apikey=a3c758c3-115f-435a-99a5-7faaf6e77297";
    }

    function returnAjaxData(emailVal) {
        $.ajax({
            type: 'GET',
            async: false,
            url: email_env_setter,
            data: "address=" + emailVal,
            success: function(response) {
                validateAjaxResponse(response);
            },
            error: function(error) {
                ajaxRequestFailure();
            }
        });
    }

    function validateAjaxResponse(obj) {
        if (obj.status === 'valid' || obj.status === 'accept_all' || obj.status === 'unknown') {
            briteVerifyStatus = {
                success: true
            }
        } else {
            briteVerifyStatus = {
                success: false,
                errorType: "b_verify_error"
            }
        }

        return briteVerifyStatus;
    }

    function ajaxRequestFailure() {
        briteVerifyStatus = {
            success: false,
            errorType: "b_verify_error",
            apiFailure: true
        }

        return briteVerifyStatus;
    }

    function leapYear(year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    }

    function getAge(DOB) {
        var today = new Date(),
            birthDate = new Date(DOB),
            age = today.getFullYear() - birthDate.getFullYear(),
            m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age = age - 1;
        }

        return age;
    }

    function defaultValidator(id, pattern) {
        var responseObj = {},
            textVal = $.trim($('#' + id).val());
        
        isValid = regexPatterns[pattern].test(textVal);

        /** Cases:
            1: Name value is missing   - type1 error
            2: Regex failure           - type2 error
            3: Network Error           - type3 error
            Defaults:
            1: success      - Boolean
            2: apiFailure   - Boolean
        */

        if (textVal === "") {
            responseObj = {
                success: false,
                errorType: "value_error"
            }
        } else if(isValid === false) {
            responseObj = {
                success: false,
                errorType: "regex_error"
            }
        } else if(isValid) {
            responseObj = {
                success: true
            }
        } else {
            responseObj = {
                success: false,
                errorType: "network_error"
            }
        }

        return responseObj;
    }

    var exposedMethods = {
        email: function(emailId) {
            var responseObj = {},
                emailVal = $('#' + emailId).val();
            
            isEmailValid = regexPatterns["email"].test($('#' + emailId).val());

            /** Cases:
                1: Input type Error         - type1 error
                2: Email value is missing   - type2 error
                3: Regex failure            - type3 error
                4: Brite-verify failure     - type4 error
                5: Network Error            - type5 error
                Defaults:
                1: success      - Boolean
                2: apiFailure   - Boolean
            */

            if ($('#' + emailId).attr("type") !== "email") {
                responseObj = {
                    success: false,
                    errorType: "input_type_error"
                }
            } else if(emailVal === "") {
                responseObj = {
                    success: false,
                    errorType: "value_error"
                }
            } else if(isEmailValid === false) {
                responseObj = {
                    success: false,
                    errorType: "regex_error"
                }
            } else if (isEmailValid) {
                returnAjaxData(emailVal);
                return briteVerifyStatus;
            } else {
                responseObj = {
                    success: false,
                    errorType: "network_error"
                }
            }

            return responseObj;
        },
        name: function(nameId) {
            var responseObj = {},
                nameVal = $.trim($('#' + nameId).val());
            
            isNameValid = regexPatterns["name"].test(nameVal);

            /** Cases:
                1: Name value is missing   - type1 error
                2: Regex failure           - type2 error
                3: Network Error           - type3 error
                Defaults:
                1: success      - Boolean
                2: apiFailure   - Boolean
            */

            if (nameVal === "" || nameVal == "First Name" || nameVal == "Last Name") {
                responseObj = {
                    success: false,
                    errorType: "value_error"
                }
            } else if(isNameValid === false) {
                responseObj = {
                    success: false,
                    errorType: "regex_error"
                }
            } else if(isNameValid) {
                responseObj = {
                    success: true
                }
            } else {
                responseObj = {
                    success: false,
                    errorType: "network_error"
                }
            }

            return responseObj;
        },
        phone: function(phoneId) {
            var responseObj = {},
                phoneVal = $('#' + phoneId).val(),
                cleanVal = phoneVal.replace(/["(,),\-,\s"]/g, ""),
                stateCode = parseInt(cleanVal.slice(0, 3));
            
            isPhoneValid = regexPatterns["phone"].test(phoneVal);

            /** Cases:
                1: Input type Error         - type1 error
                2: Phone value is missing   - type2 error
                3: Regex failure            - type3 error
                4: State Code Error         - type4 error
                5: Network Error            - type5 error
                Defaults:
                1: success      - Boolean
            */

            if ($('#' + phoneId).attr("type") !== "number") {
                responseObj = {
                    success: false,
                    errorType: "input_type_error"
                }
            } else if (cleanVal === "") {
                responseObj = {
                    success: false,
                    errorType: "value_error"
                }
            } else if(isPhoneValid === false) {
                responseObj = {
                    success: false,
                    errorType: "regex_error"
                }
            } else if(isPhoneValid && stateCodes.indexOf(stateCode) === -1) {
                responseObj = {
                    success: false,
                    errorType: "state_code_error"
                }
            } else if(isPhoneValid && stateCodes.indexOf(stateCode) > -1) {
                responseObj = {
                    success: true
                }
            } else {
                responseObj = {
                    success: false,
                    errorType: "network_error"
                }
            }

            return responseObj;
        },
        date: function(dateId) {
            var responseObj = {},
                dateVal = $('#' + dateId).val(),
                cleanVal = dateVal.split("/"),
                isLeapYear = leapYear(cleanVal[2]),
                givenMonth = cleanVal[0],
                givenDay = cleanVal[1],
                givenYear = cleanVal[2],
                leapYearDayAllowed = 0,
                givenDate = cleanVal[0] + "/" + cleanVal[1] + "/" + cleanVal[2];

            
            isRegexValid = regexPatterns["dob"].test(dateVal);

            if(isLeapYear && givenMonth === "02") {
                daysInMonth[1] = 29;
            }

            /** Cases:
                1: Date value is missing    - type1 error
                2: Regex failure            - type2 error
                3: Date Error               - type3 error
                4: Age Error                - type4 error
                5: Network Error            - type5 error
                Defaults:
                1: success      - Boolean
            */

            if (dateVal === "") {
                responseObj = {
                    success: false,
                    errorType: "value_error"
                }
            } else if(isRegexValid === false) {
                responseObj = {
                    success: false,
                    errorType: "regex_error"
                }
            } else if((!isLeapYear && givenDay > 29) || (givenDay > daysInMonth[parseInt(givenMonth) - 1]) || givenMonth > 12) {
                responseObj = {
                    success: false,
                    errorType: "date_error"
                }
            } else if(getAge(givenDate) <= 18) {
                responseObj = {
                    success: false,
                    errorType: "age_error"
                }
            } else if(getAge(givenDate) >= 18 && getAge(givenDate) !== NaN) {
                responseObj = {
                    success: true
                }
            } else {
                responseObj = {
                    success: false,
                    errorType: "network_error"
                }
            }

            return responseObj;
        },
        address: function(addId) {
            return defaultValidator(addId, "address");
        },
        city: function(cityId) {
            return defaultValidator(cityId, "city");
        },
        zipcode: function(zipId) {
            return defaultValidator(zipId, "zip");
        },
    }

    return exposedMethods;
})(jQuery);
