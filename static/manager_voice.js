async function AlgoValue(id)
{
    var idt = "#" + id;
    var time_speak = Number($(idt).data("time"));
    var field_type = $(idt).data("ftype");
    var text_to_voice = $(idt).data("tvoice");

    $(idt).focus().click();
    await GetVoiceByText(text_to_voice);
    var text = await GetVoice(time_speak);

    console.log(text);

    switch(field_type) {
        case 'text':
           $(idt).val(text);
           $(idt).attr("class", "mui-text-light mui--is-touched mui--is-dirty mui--is-not-empty");
           break;
        case 'number':
            text = text.replace(/\D/g, '');
            console.log(text);
            $(idt).val(Number(text));
            break;
        case 'time':
            text = text.replace(/\D/g, '');
            if (text.length < 4)
            {
                text = "0".concat(text);
            }

            $(idt).val(text.substr(0, text.length/2) + ':' + text.substr(text.length/2));
            break;
        case 'radio':
            $(idt + "-variant" + text).click();
            break;
        case 'select':
            $(idt + ' option[value=' + id + '-variant'+ text + ']').prop('selected', 'selected').change();
            $(idt).blur();
            break;

}
}

async function Algo()
{
    await GetVoiceByText("Привет. Я голосовой помощник Ксения и я помогу Вам заполнить форму о неисправности");
    await AlgoValue("field1");
    await AlgoValue("field2");
    await AlgoValue("field3");
    await AlgoValue("field4");
    await AlgoValue("field5");
    await AlgoValue("field6");
    await AlgoValue("field7");
    console.log("END");
}

async function GetVoice(timeToSpeak)
{
    const recordAudio = () =>
  new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(resolve => {
        mediaRecorder.addEventListener("stop", async () => {
          var audioBlob = new Blob(audioChunks);
          resolve(await sendData(audioBlob));
        });

        mediaRecorder.stop();
      });

      resolve({ start, stop });
  });

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const recorder = await recordAudio();
console.log("For start");
await PlayAudioByFile("/static/audio/pi.mp3");
recorder.start();
  await sleep(timeToSpeak);
  console.log("For stop");
  await PlayAudioByFile("/static/audio/pi.mp3");
  var txt = await recorder.stop();
  console.log("Return blb");
  return txt;

}

async function sendData(data)
    {
    console.log("SendData");
    let csrftoken = getCookie('csrftoken');
    let response=await fetch("/voice_request", {
    method: "post",
    body: data,
    headers: { "X-CSRFToken": csrftoken },
    })

    var text = await response.text();
    return text;
   }

async function GetVoiceByText(text)
{
    var Text = text;
    console.log(Text);
    let csrftoken = getCookie('csrftoken');
    let response=await fetch("/text_request", {
    method: "post",
    body: Text,
    headers: { "X-CSRFToken": csrftoken, 'content-type': 'text/plain; charset=UTF-8' },
    })

      var blob = await response.blob();
      await PlayAudioByBlob(blob);
}

async function PlayAudioByBlob(blob)
{
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    var p = new Promise(res=>{
    audio.play()
    audio.onended = res
  });
await p;
}

async function PlayAudioByFile(filePath)
{
    const audio = new Audio(filePath);

    var p = new Promise(res=>{
    audio.play()
    audio.onended = res
  });
await p;
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