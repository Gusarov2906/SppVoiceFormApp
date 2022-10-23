async function Algo()
{
    await GetVoiceByText("Привет. Перейдём к заполнению поля 1");
    $("#field1").focus();
    await GetVoiceByText("Для поля Локация проговорите примерное место нахождения объекта");
    var text = await GetVoice();
    console.log(text);
    $("#field1").val(text);
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
recorder.start();
  await sleep(3000);
  console.log("For stop");
  var txt = await recorder.stop();
  console.log("Return blb");
  return txt;

}


/*async function GetVoice()
  {
    await navigator.mediaDevices.getUserMedia({ audio: true })
  .then(async stream =>  {

    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    await mediaRecorder.addEventListener("dataavailable", async event => {
      await audioChunks.push(event.data);
    });

    await mediaRecorder.start();
    console.log("Start record");
    await sleep(async () => { } );
    mediaRecorder.stop();
    console.log("Stop record");
    const audioBlob = new Blob(audioChunks);
      return await sendData(audioBlob);


    /*await mediaRecorder.addEventListener("stop", async () => {

    });

    setTimeout(() => {


    }, 3000);
  });
    
  }*/

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