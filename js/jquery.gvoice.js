(function($){
    var initialized = false;
    var popout_open = false;
    var form_visible = false;
    var on_call = false;
    var interval = null;
    var settings =
    {
        // path to PHP script, do not change this unless you have installed it on your own server
        'php_script' : 'http://www.manifestinteractive.com/gvoice/gvoice.php?callback=gvoice_success',

        // your 40 alphanumeric google voice id as seen in their
        // flash widget FlashVars id=xxx - where xxx is your id
        // make your initial widget at:
        // https://www.google.com/voice?pli=1#webcall
        'my_google_voice_account_id' : null,

        // layout options
        'layout_show_callme' : true,

        // animation options
        'animation_use_fade' : true,
        'animation_speed' : 500,
        'animation_slide_form' : true,

        // relative or absolute URL to gvoice media folder where css file is stored
        'css_file' : 'css/gvoice.css',

        // googles voice server
        'google_post_url' : 'https://clients4.google.com/voice/embed/webButtonConnect',

        // call me text
        'call_me_text' : 'Call Me',

        // form label text
        'form_name_label' : 'Name ',
        'form_phone_label' : 'Number ',
        'form_private_label' : ' Keep number private',
        'form_submit_label' : 'Connect'
    };
    var methods = {
        init : function(options)
        {
            return this.each(function(){
                if( !initialized)
                {
                    if (options)
                    {
                        $.extend(settings, options);
                    }

                    $(this).html(methods.build_form);

                    setTimeout(function(){ methods.show(); }, 100);
                }
                else
                {
                    $.error('Button should only be added once on the page.');
                }
            });
        },
        build_form : function()
        {
            var form = '<div id="jq_gvoice_wrapper">'
            + '<div id="jq_gvoice_box"></div>'
            + '<div id="jq_gvoice_button"></div>'
            + '<div id="jq_gvoice_error"></div>'
            + '<div id="jq_gvoice_default"><div class="call_me">'+settings.call_me_text+'</div><div class="info">Click and Google will<br />connect you for free.</div></div>'
            + '<form id="jq_gvoice_form" name="jq_gvoice_form" target="" method="post" enctype="multipart/form-data">'
            + '<label for="jq_gvoice_name"><b>'
            + settings.form_name_label
            + '</b><input type="text" name="jq_gvoice_name" id="jq_gvoice_name" class="dataentry" maxlength="100" size="20" value="" />'
            + '</label>'
            + '<label for="jq_gvoice_phone"><b>'
            + settings.form_phone_label
            + '</b><input type="text" name="jq_gvoice_phone_1" id="jq_gvoice_phone_1" class="dataentry jq_gvoice_phone" maxlength="3" size="3" value="" title="Enter your Phone Number Area Code" />'
            + '<input type="text" name="jq_gvoice_phone_2" id="jq_gvoice_phone_2" class="dataentry jq_gvoice_phone" maxlength="3" size="3" value="" title="Enter your Phone Number Prefix" />'
            + '<input type="text" name="jq_gvoice_phone_3" id="jq_gvoice_phone_3" class="dataentry jq_gvoice_phone" maxlength="4" size="4" value="" title="Enter your Phone Number Line Number" />'
            + '</label>'
            + '<input type="button" name="jq_gvoice_submit" id="jq_gvoice_submit" value="'+settings.form_submit_label+'" disabled="true" />'
            + '<label for="jq_gvoice_private">'
            + '<input type="checkbox" name="jq_gvoice_private" id="jq_gvoice_private" value="1" /><span class="small">'
            + settings.form_private_label
            + '</span></label>'
            + '</form></div>';

            return form;
        },
        show : function()
        {
            // clear any attempt to close
            clearInterval(interval);
            
            // start showing widget
            jQuery('#jq_gvoice_wrapper').show();
            jQuery('#jq_gvoice_button').show();
            jQuery('.dataentry').keyup(function(){
                if(jQuery('#jq_gvoice_name').val() != '' && jQuery('#jq_gvoice_phone_1').val().length == 3 && jQuery('#jq_gvoice_phone_2').val().length == 3 && jQuery('#jq_gvoice_phone_3').val().length == 4)
                {
                    jQuery('#jq_gvoice_submit').removeAttr('disabled');
                }
                else
                {
                    jQuery('#jq_gvoice_submit').attr('disabled', true);
                }
                interval = setTimeout(function(){ methods.reset(); }, 10000);
            });
            jQuery('.jq_gvoice_phone').keypress(function(e){
                return methods.valid_phone(e);
            });
            jQuery('.jq_gvoice_phone').keyup(function(e){
                methods.auto_tab(e);
            });

            if(settings.layout_show_callme)
            {
                jQuery('#jq_gvoice_box').show();
                jQuery('#jq_gvoice_default').show();
                jQuery('#jq_gvoice_button, #jq_gvoice_default').click(function(){
                    if( !form_visible)
                    {
                        // clear any attempt to close
                        clearInterval(interval);

                        form_visible = true;
                        methods.fade_in('#jq_gvoice_form');
                        jQuery('#jq_gvoice_name').focus();
                        interval = setTimeout(function(){ methods.reset(); }, 10000);
                    }
                });
            }
            else
            {
                jQuery('#jq_gvoice_button').hover(function(){
                    if( !popout_open)
                    {
                        jQuery('#jq_gvoice_box').show();
                        jQuery('#jq_gvoice_default').show();
                    }
                },
                function(){
                    if( !popout_open)
                    {
                        jQuery('#jq_gvoice_box').hide();
                        jQuery('#jq_gvoice_default').hide();
                    }
                });

                jQuery('#jq_gvoice_button').click(function(){
                    if( !form_visible)
                    {
                        // clear any attempt to close
                        clearInterval(interval);

                        form_visible = true;
                        popout_open = true;
                        jQuery('#jq_gvoice_box').show();
                        jQuery('#jq_gvoice_default').hide();
                        methods.fade_in('#jq_gvoice_form');
                        jQuery('#jq_gvoice_name').focus();
                        interval = setTimeout(function(){ methods.reset(); }, 10000);
                    }
                });
            }

            jQuery('#jq_gvoice_submit').click(function(){
                if( !on_call)
                {
                    on_call = true;
                    methods.make_call();
                }
                else
                {
                    on_call = false;
                    methods.end_call();
                }
            });
        },
        hide : function()
        {
            methods.fade_out('#jq_gvoice_form');
            jQuery('#jq_gvoice_wrapper').hide();
            jQuery('#jq_gvoice_default').unbind('click');
            jQuery('.jq_gvoice_phone').unbind('keypress');
            jQuery('.jq_gvoice_phone').unbind('auto_tab');
        },
        fade_in : function(element)
        {
            if(settings.animation_use_fade && navigator.appName != 'Microsoft Internet Explorer')
            {
                jQuery(element).fadeIn(settings.animation_speed);
            }
            else
            {
                jQuery(element).show();
            }
        },
        fade_out : function(element)
        {
            if(settings.animation_use_fade && navigator.appName != 'Microsoft Internet Explorer')
            {
                jQuery(element).fadeOut(settings.animation_speed);
            }
            else
            {
                jQuery(element).hide();
            }
        },
        reset : function()
        {
            clearInterval(interval);
            if(jQuery('.dataentry').val() == '')
            {
                form_visible = false;
                if(settings.layout_show_callme)
                {
                    methods.fade_out('#jq_gvoice_form');
                }
                else
                {
                    popout_open = false;
                    jQuery('.dataentry').blur();
                    jQuery('#jq_gvoice_box').hide();
                    jQuery('#jq_gvoice_form').hide();
                }
            }
        },
        valid_phone : function(e)
        {
            if((e.which >= 32 && e.which <= 47) || e.which >= 58)
            {
                jQuery('#jq_gvoice_error').html('Invalid Character &nbsp;<span>( Use: 0-9 )<\/span>').show();
                return false;
            }
            else
            {
                jQuery('#jq_gvoice_error').html('').hide();
                return true;
            }
        },
        auto_tab : function(e)
        {
            if(e.which != 9 && e.which != 16)
            {
                if (jQuery('#jq_gvoice_phone_1').val().length == 3)
                {
                    jQuery('#jq_gvoice_phone_2').focus();
                }
                if (jQuery('#jq_gvoice_phone_2').val().length == 3)
                {
                    jQuery('#jq_gvoice_phone_3').focus();
                }
            }
        },
        build_number : function()
        {
            return '1'
                +jQuery('#jq_gvoice_phone_1').val()
                +jQuery('#jq_gvoice_phone_2').val()
                +jQuery('#jq_gvoice_phone_3').val();
        },
        make_call : function()
        {
            $.ajax({
                type: 'POST',
                url: settings.google_post_url,
                data:
                {
                    showCallerNumber: (jQuery('#jq_gvoice_private:checked').val()) ? 1:0,
                    callerNumber: methods.build_number,
                    buttonId: settings.my_google_voice_account_id,
                    name: jQuery('#jq_gvoice_name').val(),
                    post_url: settings.google_post_url 
                }
            });
        },
        end_call : function()
        {
            $.post(settings.google_post_url,
            {
                    callerNumber: methods.build_number,
                    buttonId: settings.my_google_voice_account_id,
                    post_url: settings.google_post_url
            });
        },
        gvoice_success : function(json)
        {
            alert('json: '+json);
        }
    };

    $.fn.gvoice = function(method)
    {
        if (methods[method])
        {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method)
        {
            return methods.init.apply(this, arguments);
        }
        else
        {
            $.error('Method '+method+' does not exist on jQuery.gvoice');
        }
    };
})(jQuery);