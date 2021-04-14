$(function () {
  $('#controls').on('mousedown touchstart', (e) => {
    if (e.target.id === 'controls') {
      return;
    }
    var deviceId = $('#deviceId').val();
    $.ajax({
      type: 'POST',
      url: '/config/ajax',
      data: { id: e.target.id, command: 'Select', deviceId },
      dataType: 'JSON',
      error: () => {
        location.reload();
      },
    });
  });
  $('#controls').on('mouseup touchend', (e) => {
    if (e.target.id === 'controls') {
      return;
    }
    var deviceId = $('#deviceId').val();
    $.ajax({
      type: 'POST',
      url: '/config/ajax',
      data: { id: e.target.id, command: 'Release', deviceId },
      dataType: 'JSON',
      error: () => {
        location.reload();
      },
    });
  });
  $('.select2').select2();
  $('.select2').on('select2:select', (e) => {
    location.replace(`/config?deviceId=${e.params.data.id}`);
  });
  $('#dialSubmit').on('click', (e) => {
    var deviceId = $('#deviceId').val();
    var uri = $('#dialString').val();
    $.ajax({
      type: 'POST',
      url: '/config/ajax',
      data: { id: 'Dial', uri, deviceId },
      dataType: 'JSON',
      success: () => {
        setTimeout(location.reload(), 3000);
      },
      error: () => {
        location.reload();
      },
    });
  });
  $('#dialString').on('keypress', (e) => {
    console.log(e.key);
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#dialSubmit').trigger('click');
    }
  });
  $('#endCall').on('click', (e) => {
    var deviceId = $('#deviceId').val();
    $.ajax({
      type: 'POST',
      url: '/config/ajax',
      data: { id: 'End', deviceId },
      dataType: 'JSON',
      success: () => {
        location.reload();
      },
      error: () => {
        location.reload();
      },
    });
  });
  $('#trackToggle').on('click', (e) => {
    var deviceId = $('#deviceId').val();
    var state = $('#trackState').text();
    $.ajax({
      type: 'POST',
      url: '/config/ajax',
      data: { id: 'TrackToggle', state, deviceId },
      dataType: 'JSON',
      success: () => {
        location.reload();
      },
      error: () => {
        location.reload();
      },
    });
  });
});
