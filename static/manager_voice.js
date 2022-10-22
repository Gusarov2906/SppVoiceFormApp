function get_voice()
  {
    navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    console.log("Start record");

    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      sendData(audioBlob);
    });

    setTimeout(() => {
      mediaRecorder.stop();
      console.log("Stop record");
    }, 3000);
  });
    
  }

async function sendData(data) 
    {
    let csrftoken = getCookie('csrftoken');
    let response=await fetch("/voice_request", {
    method: "post",
    body: data,
    headers: { "X-CSRFToken": csrftoken },
    })

    let respText = await response.text();
      $('#field1').val(respText);
   }

async function GetVoiceByText()
{
    var Text = $("#field1").val();
    let csrftoken = getCookie('csrftoken');
    let response=await fetch("/text_request", {
    method: "post",
    body: Text,
    headers: { "X-CSRFToken": csrftoken, 'content-type': 'text/plain; charset=UTF-8' },
    })

      var blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();

      //console.log("Start play record");
}

// Get CSRF Token by Cookie
function getCookie(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
              var cookie = cookies[i].trim();
              // Does this cookie string begin with the name we want?
              if (cookie.substring(0, name.length + 1) === (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }