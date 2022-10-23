async function Algo()
{
    await GetVoiceByText("Привет. Я голосовой помощник Ксения и я помогу Вам заполнить форму о неисправности");
    $("#field1").focus();
    await GetVoiceByText("Для выбора типа объекта, проговорите номер выбранного типа. 1 - Светофор. 2 - Камера. 3 - Другое");
    var text = await GetVoice();
    $("#field1-variant".concat(text)).click();
    console.log(text);

    $("#field2").focus();
    await GetVoiceByText("Для заполнения поля идентификатор объекта проговорите его");
    var text = await GetVoice();
    console.log(text);
    $("#field2").val(text);

    $("#field3").focus().click();
    await GetVoiceByText("Для выбора типа неисправности, проговорите номер выбранного типа. 1 - Программный сбой. 2 - Поломка. 3 - Другой");
    var text = await GetVoice();
    $('#field3 option[value=field3-variant'.concat(text.concat(']'))).prop('selected', 'selected').change();
    $("#field3").blur();
    console.log(text);

    $("#field4").focus().click();
    await GetVoiceByText("Коротко расскажите про неисправность");
    var text = await GetVoice();
    $("#field4").val(text);

    $("#field5").focus();
    await GetVoiceByText("Уточните время неисправности");
    var text = await GetVoice();
    text = text.replace(' ', ':');
    $("#field5").val(text);

    $("#field6").focus();
    await GetVoiceByText("Скажите где примерно обнаружена неисправность");
    var text = await GetVoice();
    $("#field6").val(text);

    $("#field7").focus();
    await GetVoiceByText("Прокомментируйте неисправоность. При нежелании давать комментарий скажите Пропустить");
    var text = await GetVoice();
    $("#field7").val(text);

    console.log("END");
}

async function GetVoice()
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
  await sleep(3000);
  console.log("For stop");
  await PlayAudioByFile("/static/audio/pi.mp3");
  var txt = await recorder.stop();
  console.log("Return blb");
  return txt;

}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep(fn, ...args) {
    await timeout(3000);
    return fn(...args);
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