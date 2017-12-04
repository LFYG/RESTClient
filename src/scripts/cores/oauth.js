/* ***** BEGIN LICENSE BLOCK *****
Copyright (c) 2007-2017, Chao ZHOU (chao@zhou.fr). All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the author nor the names of its contributors may
      be used to endorse or promote products derived from this software
      without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ***** END LICENSE BLOCK ***** */

$(function () {

  // When toggle oauth timestamp auto mode
  $(document).on('click', '#oauth-timestamp-auto', function () {
    $(this).parents('.form-group').removeClass('has-error');
    var checked = $(this).is(':checked');
    if(checked)
    {
      $('#oauth-timestamp').val('').attr('readonly', 'true');
      $('#oauth-timestamp-help').text('').hide();
    }
    else
    {
      var ts = Misc.timestamp();
      $('#oauth-timestamp').val(ts).removeAttr('readonly');
      $('#oauth-timestamp-help').text(Misc.getDateFromTimestamp(ts)).show();
    }
    console.log('clicked', );
  });


  // When user input a new timestamp, it should show it's date value
  $(document).on('input', '#oauth-timestamp', function () {
    var ts = Number.parseInt($(this).val());
    console.log(typeof ts );
    if( _.isNaN(ts) )
    {
      $(this).parents('.form-group').addClass('has-error');
      $('#oauth-timestamp-help').text('Invalid timestamp').show();
      return false;
    }
    $(this).parents('.form-group').removeClass('has-error');
    $('#oauth-timestamp-help').text(Misc.getDateFromTimestamp(ts)).show();
  });
  
  // When toggle oauth nonce auto mode
  $(document).on('click', '#oauth-nonce-auto', function () {
    var checked = $(this).is(':checked');
    if (checked) {
      $('#oauth-nonce').val('').attr('readonly', 'true');
    }
    else {
      $('#oauth-nonce').val(Misc.random(16)).removeAttr('readonly');
    }
  });

  // When toggle realm disable mode
  $(document).on('click', '#oauth-realm-disabled', function () {
    var checked = $(this).is(':checked');
    if (checked) {
      $('#oauth-realm-auto').prop("checked", true).attr('disabled', 'disabled');
      $('#oauth-realm').val('').attr('readonly', 'true');
    }
    else {
      $('#oauth-realm-auto').removeAttr('disabled');
    }
  });

  // When toggle realm auto mode
  $(document).on('click', '#oauth-realm-auto', function () {
    var checked = $(this).is(':checked');
    if (checked) {
      $('#oauth-realm').attr('readonly', 'true').val('');
    }
    else {
      $('#oauth-realm').removeAttr('readonly');
    }
  });

  $(document).on('submit', '#form-oauth', function(e){
    e.preventDefault();
    $('#modal-oauth .has-error').removeClass('has-error');

    var params = {
      'consumer_key': $('#oauth-consumer-key').val(),
      'shared_secret': $('#oauth-shared-secret').val(),
      'access_token': $('#oauth-access-token').val(),
      'access_secret': $('#oauth-access-token-secret').val(),
      'parameter_transmission': $('[name="oauth-parameter-transmission"]:checked').val(),
      'oauth_version': '1.0',
      'oauth_signature_method': $('[name="oauth-signature-method"]:checked').val(),
      'oauth_nonce': $('#oauth-nonce-auto').is(':checked') ? true : $('#oauth-nonce').val(),
      'oauth_timestamp': $('#oauth-timestamp-auto').is(':checked') ? true : $('#oauth-timestamp').val(),
      'encode_signature': $('[name="oauth-encode-signature"][value="1"]').is(':checked')
    };
    if (!$('#oauth-realm-disabled').is(':checked'))
    {
      params['oauth_realm'] = $('#oauth-realm-auto').is(':checked') ? true : $('#oauth-realm').val();
    }

    var error = false;
    if(params.consumer_key == '')
    {
      $('#oauth-consumer-key').parents('.form-group').addClass('has-danger').find('.helper').show();
      error = true;
    }
    if (params.shared_secret == '') {
      $('#oauth-shared-secret').parents('.form-group').addClass('has-danger').find('.helper').show();
      error = true;
    }

    if(error)
    {
      return false;
    }

    if ($('#save-oauth').is(':checked')) {
      storage.set({ ['oauth']: params }).then(() => {
        console.log('[oauth.js] storage saved!');
      });
    }
    else
    {
      storage.remove('oauth').then(() => {
        console.log('[oauth.js] storage removed!');
      });
    }
    console.log('[oauth.js] oauth-form submit', params);
    $('.authentication-mode').removeClass('active');
    $('.authentication-mode[data-mode="oauth10"]')
        .addClass('active')
        .data('params', params);
    $('#modal-oauth').modal('hide');
  });

  $(document).on('show.bs.modal', '#modal-oauth', function (e) {
    $('#modal-oauth .has-error').removeClass('has-error');
    $('#form-oauth')[0].reset();
    $('#oauth-realm').prop('readonly', true);
    $('#oauth-nonce').prop('readonly', true);
    $('#oauth-timestamp').prop('readonly', true);
    $('#save-oauth').prop('checked', false);

    // update oauth 1.0 form
    var initOauthForm = function (oauth) 
    {
      $('#oauth-consumer-key').val(oauth.consumer_key);
      $('#oauth-shared-secret').val(oauth.shared_secret);
      $('#oauth-access-token').val(oauth.access_token);
      $('#oauth-access-token-secret').val(oauth.access_secret);
      $(`[name="oauth-parameter-transmission"][value="${oauth.parameter_transmission}"]`).prop('checked', true);
      $('#oauth-version').val(oauth.oauth_version);
      $(`[name="oauth-signature-method"][value="${oauth.oauth_signature_method}"]`).prop('checked', true);
      if (oauth.oauth_nonce === true) {
        $('#oauth-nonce-auto').prop('checked', true);
        $('#oauth-nonce').val('').prop('readonly', true);
      }
      else {
        $('#oauth-nonce-auto').prop('checked', false);
        $('#oauth-nonce').val(oauth.oauth_nonce).prop('readonly', false);
      }

      if (oauth.oauth_timestamp === true) {
        $('#oauth-timestamp-auto').prop('checked', true);
        $('#oauth-timestamp').val('').prop('readonly', true);
      }
      else {
        $('#oauth-timestamp-auto').prop('checked', false);
        $('#oauth-timestamp').val(oauth.oauth_timestamp).prop('readonly', false);
      }

      if (typeof oauth.oauth_realm == 'undefined') {
        $('#oauth-realm-disabled').prop('checked', true);
        $('#oauth-realm-auto').prop('checked', true);
        $('#oauth-realm').val('').prop('readonly', true);
      }
      else {
        $('#oauth-realm-disabled').prop('checked', false);
        if (oauth.oauth_realm === true) {
          $('#oauth-realm-auto').prop('checked', true);
          $('#oauth-realm').val('').prop('readonly', true);
        }
        else {
          $('#oauth-realm-auto').prop('checked', false);
          $('#oauth-realm').val(oauth.oauth_realm).prop('readonly', false);
        }
      }
    };

    // if it is called for updating oauth parameters
    if ($('#modal-oauth').data('params'))
    {
      var params = $('#modal-oauth').data('params');
      console.log('[oauth.js] update oauth parameters', params);
      $('#modal-oauth').removeData('params');
      initOauthForm(params);
    }
    else
    {
      // checked if there is saved parameters in storage
      storage.get('oauth').then((data) => {
        console.log('[oauth.js] storage loaded!', data);
        if (!data || !data.oauth) {
          return false;
        }

        initOauthForm(data.oauth);
        $('#save-oauth').prop('checked', true);
      });
    }
  });

  $(document).on('click', '.authentication-mode[data-mode="oauth10"] .btn-edit', function(e){
    var params = $(this).parents('.authentication-mode').data('params');
    console.log('[oauth.js] edit oauth parameters', params);
    $('#modal-oauth').data('params', params).modal('show');
  });

  $(document).on('click', '.authentication-mode[data-mode="oauth10"] .btn-preview', function (e) {
    var params = $(this).parents('.authentication-mode').data('params');
    console.log('[oauth.js] preview oauth parameters', params);
    $('#modal-oauth-preview').data('params', params).modal('show');
  });

  $(document).on('show.bs.modal', '#modal-oauth-preview', function (e) {
    var params = $('.authentication-mode[data-mode="oauth10"]').data('params');
    var oauth = new OAuthSimple(params.consumer_key, params.shared_secret);
    var url = $('#request-url').val();
    var idx = url.indexOf('?');
    if (idx >= 0)
    {
      var path = url.substr(0, idx);
      var queryString = url.substr(idx + 1);
      oauth.setURL(path);
      oauth.setParameters(queryString);
      console.log('[oauth.js] setUrl & parameters', path, queryString);
    }
    else
    {
      oauth.setURL(url);
      console.log('[oauth.js] setUrl', url);
    }
    
    oauth.setAction($('#request-method').val());
    console.log('[oauth.js] setAction', $('#request-method').val());

    var signed = oauth.sign();
    console.log('[oauth.js] sign', signed);

    if(params.parameter_transmission == 'query')
    {
      
    }
  });
});