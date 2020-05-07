window.onload = function(e) {
    $('#main').hide();

    var isShown = false;
    var currentPage = $('#login');
    var currectCheckbox = $('#lang1').attr('id');

    $('input[type="checkbox"]').on('change', function() {
        if (currectCheckbox != $(this).attr('id')) {
            $('#'+currectCheckbox).prop('checked', false);                
            currectCheckbox = $(this).attr('id');
            setLanguage($(this).attr('id') == 'lang1' ? 'pl' : 'eng');
        }
    });
    
    window.addEventListener("message", (event) => {
        var item = event.data;
        if (item !== undefined) {
            switch(item.type) {
                case 'ON_STATE':
                    if(item.state === true) {
                        $('#main').show();
                        isShown = true;
                    } else {
                        $('#main').hide();
                        isShown = false;
                    }
                    break;
                case 'ON_SHOW_LS':
                    showLoadingScreen();
                    break;
                case 'ON_RESPONSE':
                    if (item.msg !== undefined) {
                        gotResponse(item.msg);
                    }
                    break;
                default:
                    break;
            }
        }
    })

    window.checkLogin = function(login) {
        var loginMinLen = 6;
        var loginMaxLen = 15;
        var error = false; 

        if (login.length < loginMinLen || login.length > loginMaxLen) {
            $('#er-correct-len-l').css('color', 'red');
            error = true;
        } else {
            $('#er-correct-len-l').css('color', '#0eca17');
        }

        if (!login.match("^[A-z0-9]+$")) {
            $('#er-correct-letters-l').css('color', 'red');
            error = true;
        } else {
            $('#er-correct-letters-l').css('color', '#0eca17');
        }

        if (error) return false;
        return true;
    };

    window.checkPassword = function() {
        var passwordMinLen = 8;
        var passwordMaxLen = 32;
        var password = $('#r_password1').val();
        var pass2 = $('#r_password2').val();
        var error = false;

        if (password.length < passwordMinLen || password.length > passwordMaxLen) {
            $('#er-correct-len-p').css('color', 'red');
            error = true;
        } else {
            $('#er-correct-len-p').css('color', '#0eca17');
        }

        if (password != pass2) {
            $('#er-same-strings-p').css('color', 'red');
            error = true;
        } else {
            $('#er-same-strings-p').css('color', '#0eca17');
        }

        if (error) return false;
        return true;
    };

    window.validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var correctString = re.test(String(email).toLowerCase());

        if (!correctString) {
            $('#er-corrent-form-e').css('color', 'red');
        } else {
            $('#er-corrent-form-e').css('color', '#0eca17');
        }
        
        return correctString;
    };

    window.showLoadingScreen = function() {
        $('.ls-info').text('Waiting for server to answer..');
        $('.loading-screen').show();
        $('.ls-gif').show();
        $('.ls-response').hide();
        $('.ls-close-btn').hide();
    };

    window.hideLoadingScreen = function() {
        $('.loading-screen').hide();
    };
    hideLoadingScreen();
    
    window.gotResponse = function(response) {
        $('.ls-info').text(response);
        $('.ls-response').show();
        $('.ls-gif').hide();
        $('.ls-close-btn').show();
    }

    // setTimeout(gotResponse, 2500, 'kekistan is here o,O')

    $('.login-click').click(function(){
        currentPage.hide();
        $('#login').show();
        currentPage = $('#login'); 
    });
    $('.forgot-pw-click').click(function(){
        currentPage.hide();
        $('#email').show();
        currentPage = $('#email'); 
    });
    $('.register-click').click(function(){
        currentPage.hide();
        $('#register').show();
        currentPage = $('#register'); 
    });

    // $(document).keydown((event) => {
    //     if(event.which == 88) {
    //         if (isShown) {
    //             $.post('http://tools/getData', JSON.stringify({
    //                 action: 'CLOSE_UI'
    //             }));
    //         }
    //     }
    // });

    $('#r_login').on('input', function() {
        $('.error-info-box.er-login').show();
        checkLogin($('#r_login').val());
    });
    
    $('#r_email').on('input', function() {
        $('.error-info-box.er-email').show();
        validateEmail($('#r_email').val());
    });

    $('#r_password1').on('input', function() {
        $('.error-info-box.er-password').show();
        checkPassword();
    });

    $('#r_password2').on('input', function() {
        $('.error-info-box.er-password').show();
        checkPassword();
    });
    
    // showLoadingScreen();
    $('#ls-clse-btn').click(function() {
        hideLoadingScreen();
    });

    $('#change-btn').click(function() {
        var email = $('#r_email').val();

        if (validateEmail(email)) {
            $.post('http://fq_login/getData', JSON.stringify({
                action: 'CHANGE_PASSWORD',
                _email: email,
            }));
        }
    });

    $('#log-btn').click(function() { // login button click
        var password = $('#l_password').val();
        var login = $('#l_login').val();

        if (login.length >= 6) {
            if (password.length >= 8) {
                $.post('http://fq_login/getData', JSON.stringify({
                    action: 'AUTH',
                    _login: login,
                    _password: password,
                }));
            }
        }
    });

    $('#reg-btn').click(function() { // register button click
        var password = $('#r_password1').val();
        var login = $('#r_login').val();
        var email = $('#r_email').val();
        
        if(checkLogin(login)) {
            if (checkPassword()) {
                if (email.length > 0) {
                    if (validateEmail(email)) {
                        $.post('http://fq_login/getData', JSON.stringify({
                            action: 'SEND_AUTH_DATA',
                            _login: login,
                            _password: password,
                            _email: email
                        }));
                    }
                } else {
                    $.post('http://fq_login/getData', JSON.stringify({
                        action: 'SEND_AUTH_DATA',
                        _login: login,
                        _password: password,
                        _email: -1
                    }));
                }
            }
        }
    });

    window.setLanguage = function(x) {
        $.post('http://fq_login/getData', JSON.stringify({
            action: 'SET_LANG',
            lang: x,
        }));
    }
}