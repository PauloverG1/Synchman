(() => {
    function setupForm() {
        // Track dirty state of form fields
        const dirtyFields = {};

        // Listen for input change events to mark fields as dirty
        const formInputs = document.getElementsByTagName("input");
        for (var i = 0; i < formInputs.length; i++) {
            formInputs[i].addEventListener("input", function () {
                dirtyFields[this.id] = true;
            });
        }

        const selectElement = document.getElementById("industry");
        selectElement.addEventListener("change", function () {
            dirtyFields[this.id] = true;
        });

        // Handle form submission
        const submitBtn = document.getElementById('submit-btn');
            submitBtn.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default form submission

            // Validate form fields only if they are dirty
            Object.keys(dirtyFields).forEach((field) => {
                const inputElement = document.getElementById(field);
                if (dirtyFields[field] && !inputElement.checkValidity()) {
                    inputElement.classList.add("error");
                } else {
                    inputElement.classList.remove("error");
                }
            });


            // Check if any dirty fields are invalid
             invalidDirtyFields = Object.keys(dirtyFields).filter((field) => {
                return dirtyFields[field] && !document.getElementById(field).checkValidity();
            });




         /*   function checkCaptchaVal() {
                if ($("#g-recaptcha-response").val() == "") {
                    $("#request_g_captcha_error").show();
                    document.getElementById('request_g_captcha_error').style = 'color:red';
                    return true;
                }
                return;
            }*/

            if (invalidDirtyFields.length > 0) {
               
                return false;
            }
        });
        
    
    }
   
    var intentFlag = true;
    var lastFieldTouched = '';
    var isFormSubmitted = false
    var invalidDirtyFields='';
    var submitcount=0;

    // on first interaction of any field
    $('.partnerwithus').focus(function () {
        lastFieldTouched = $(this).attr('name');
        if (intentFlag) {
            handleFormAnalytics("partner with us form", "intent", "");
            intentFlag = false;
        }
    });

    var fistInputValue = false;
    $('.partnerwithus').on("keypress", function (e) {

        if(isFormSubmitted)
            document.getElementById("form-success-msg").style.display = "none";
        
        if (document.querySelector("#partner-form").dataset.edited != "true" && !fistInputValue) {
            document.querySelector("#partner-form").dataset.edited = "true";
            fistInputValue = true;
            handleFormAnalytics("partner with us form", "start", "");
        }
    });

    $('.partnerwithus').on("change", function (e) {
        var fieldVal = document.querySelector('.single-select').value;
        if (fieldVal != "" && !fistInputValue) {
            fistInputValue = true;
            handleFormAnalytics("partner with us form", "start", "");
        }
    });

    window.onbeforeunload = function () {
        //lastFieldTouched = $(this).attr('name');
        if (!isFormSubmitted && lastFieldTouched !== "") {
            handleFormAnalytics("partner with us form", "abondon", lastFieldTouched);
        }
    };


    function onload() {
    var element = document.getElementById('submit-btn');
     element.onclick = validateFields;
    }
    initWebForm("form");
    onload();

    function validateFields(){
        var email = document.getElementById('email').value;
        var firstName = document.getElementById('firstName').value;
        var lastName = document.getElementById('lastName').value;
        var companyName = document.getElementById('companyName').value;
        var phoneNumber = document.getElementById('phoneNumber').value;
        var industry = document.getElementById('industry').value;

        var error = false;
        var error_fields = [];

        if (typeof email === "string" && email.length === 0) {
            document.getElementById('email_error').style.display = "block";
            error_fields.push("email : " + document.getElementById('email_error').innerText);
            error = true;
        } else {
            const regexMatch = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            if (!regexMatch) {
                document.getElementById('emailAddress_error').style.display = "block";
                error_fields.push("email : " + document.getElementById('emailAddress_error').innerText);
                error = true;
            } else {
                document.getElementById('emailAddress_error').style.display = "none";
            }
            document.getElementById('email_error').style.display = "none";
        }
        if (typeof firstName === "string" && firstName.length === 0) {
            document.getElementById('firstName_error').style.display = "block";
            error_fields.push("firstName : " + document.getElementById('firstName_error').innerText);
            error = true;
        } else {
            document.getElementById('firstName_error').style.display = "none";
            const regexMatch = /^[A-Za-z]+$/.test(firstName);
            if (!regexMatch) {
                document.getElementById('firstNameValid_error').style.display = "block";
                error_fields.push("firstName : " + document.getElementById('firstName_error').innerText);
                error = true;
            } else {
                document.getElementById('firstNameValid_error').style.display = "none";
            }
        }
        if (typeof lastName === "string" && lastName.length === 0) {
            document.getElementById('lastName_error').style.display = "block";
            error_fields.push("lastName : " + document.getElementById('lastName_error').innerText);
            error = true;
        } else {
            document.getElementById('lastName_error').style.display = "none";
            const regexMatch = /^[A-Za-z]+$/.test(lastName);
            if (!regexMatch) {
                document.getElementById('lastNameValid_error').style.display = "block";
                error_fields.push("lastname : " + document.getElementById('lastName_error').innerText);
                error = true;
            } else {
                document.getElementById('lastNameValid_error').style.display = "none";
            }
        }
        if (typeof companyName === "string" && companyName.length === 0) {
            document.getElementById('companyName_error').style.display = "block";
            error_fields.push("companyName : " + document.getElementById('companyName_error').innerText);
            error = true;
        } else {
            document.getElementById('companyName_error').style.display = "none";
        }
        if (typeof phoneNumber === "string" && phoneNumber.length === 0) {
            document.getElementById('phoneNumber_error').style.display = "block";
            error_fields.push("phoneNumber : " + document.getElementById('phoneNumber_error').innerText);
            error = true;
        } else {
            const phoneRegexMatch = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phoneNumber);
            if (!phoneRegexMatch) {
                document.getElementById('phoneNumberFormat_error').style.display = "block";
                error_fields.push("phoneNumber : " + document.getElementById('phoneNumberFormat_error').innerText);
                error = true;
            } else {
                document.getElementById('phoneNumberFormat_error').style.display = "none";
            }
            document.getElementById('phoneNumber_error').style.display = "none";
        }
        if (typeof industry === "string" && industry.length === 0) {
            document.getElementById('industry_error').style.display = "block";
            error_fields.push("industry : " + document.getElementById('industry_error').innerText);
            error = true;
        } else {
            document.getElementById('industry_error').style.display = "none";
        }

        if (error_fields.length > 0) {
            var error_message = "";
            var i;
            for (i = 0; i < error_fields.length; i++) {
                if (error_message && 0 < error_message.length) {
                    error_message += ";";
                }
                error_message += error_fields[i];
            }
            handleFormAnalytics("partner with us form", "error", error_message);
        }

        if (!error) {
            grecaptcha.execute();
        } 
    }


    function submitFormData(){
        var reqData = {};
        var formFields = $('#partner-form').serializeArray();
        for (var i = 0; i < formFields.length; i++) {
            field = formFields[i];
            key = field['name'];
            value = field['value'];
            // formData.append(key, value);
            reqData[key] = value;
        }
        $.ajax('/sites/Satellite?pagename=PartnerWithUsDataPost', {
            type: 'POST', // http method
            crossDomain: true,
            data: reqData, // data to submit
			timeout: 5000, // Set your desired timeout in milliseconds (e.g., 5 seconds)
            success: function (data) {
				const response = JSON.parse(data);
                if (data.includes('SUCCESS')) { // The POST forwarding JSP will return "SUCCESS" or "ERROR".
                    document.getElementById("form-success-msg").style.display = "block";
                    document.getElementById("form-fail-msg").style.display = "none";
                    isFormSubmitted = true;
                    document.querySelector("#partner-form").reset();
                    if(submitcount==0){
                        handleFormAnalytics("partner with us form", "complete", "");
                        submitcount++;
                    }
                } else {
                    document.getElementById("form-fail-msg").style.display = "block";
                    document.getElementById("form-success-msg").style.display = "none";
					logDetails.status = response.status;
					logDetails.statusCode = response.statuscode;
					logDetails.formName = "partner with us form";
					logDetails.errorMsg = response.msg;
					logFailure(logDetails);
                }
                grecaptcha.reset();
            },
			error: function (xhr, status, errorMessage) {
				if (status === "timeout") {
					logDetails.errorMsg = "Request timed out after 5 seconds!";
				} else {
					logDetails.errorMsg = "Issue in CMS connectivity - " + errorMessage;
				}
				logDetails.status = status;
				logDetails.statusCode = xhr.status;
				logDetails.formName = "partner with us form";
				logFailure(logDetails);
			}
        });

    }
    window.submitFormData = submitFormData;

    function handleFormAnalytics(appType, action, msg) {
        _SFDDL.formAction =
        {
            "appType": appType,//"latinx-signup" + pageName,
            "action": action,
            "message": msg    //"form submit error"
        };
      
        let event = new CustomEvent('syfformload');
        window.dispatchEvent(event);
    }
    document.addEventListener('DOMContentLoaded', () => {
        setupForm();
    })

})();

/*ADA fix*/
  /*  var btn=document.querySelectorAll(".button-solid");
    btn.forEach((e)=>{
       e.addEventListener("keydown",function(event){
        if(event.keyCode===13 || event.keyCode===32){
            e.querySelector("a").click();
        }
        })
        });
        window.addEventListener("load",function(){ 
            var btn=document.querySelectorAll(".button-solid");
            if(btn){
           btn.forEach((e)=>{
            if(e.querySelector("a")){
               e.querySelector("a").setAttribute("tabindex","-1");
            }
             })
            }
         });*/
     