/**
 * Осуществляет заполнение и валидацию поля с идентификатором id
 *
 * @param {number} id Идентификатор поля.
 */
async function CompletingField(id)
{
    var idt = "#" + id;
    var isRequiered = $(idt).data("required");
    if (isRequiered == undefined)
    {
        isRequiered = false;
    }

    var pattern = $(idt).data("pattern");
    var textEmpty = $(idt).data("tempty");
    var textError = $(idt).data("perror");

    var time_speak = Number($(idt).data("time"));
    var field_type = $(idt).data("ftype");
    var text_to_voice = $(idt).data("tvoice");

    $(idt).focus().click();
    await GetVoiceByText(text_to_voice);

    while (true)
    {
        var text = await GetVoiceToSend(time_speak);
        if (text == "пропустить")
        {
            if (!isRequiered)
            {
                await GetVoiceByText("Поле будет пропущено");
                break;
            }
            else
            {
                await GetVoiceByText("Данное поле обязательно для заполнения. Его нельзя пропустить. Пожалуйста повторите ввод");
            }
        }

        switch(field_type) {
            case 'text':
                if (isRequiered && text.length == 0)
                {
                    await GetVoiceByText(textEmpty);
                    continue;
                }
               $(idt).val(text);
               $(idt).attr("class", "mui-text-light mui--is-touched mui--is-dirty mui--is-not-empty");
               break;
            case 'number':
                text = text.replace(/\D/g, '');
                if (isRequiered && text.length == 0)
                {
                    await GetVoiceByText(textEmpty);
                    continue;
                }
                $(idt).val(Number(text));
                break;
            case 'time':
                text = text.replace(/\D/g, '');
                if (text.length < 4)
                {
                    text = "0".concat(text);
                }

                if (text.length != 4)
                {
                    await GetVoiceByText("Произнесённая фраза не соответствует формату времени. Пожалуйста повторите ещё раз.");
                    continue;
                }

                $(idt).val(text.substr(0, text.length/2) + ':' + text.substr(text.length/2));
                break;
            case 'radio':
                text = text.replace(/\D/g, '');
                if (isRequiered && (text.length <= 0 || $(':radio[name='+$(idt).attr("name")+']').length < Number(text) || Number(text) < 1))
                {
                    await GetVoiceByText("Элемент с таким номером отсутствует. Пожалуйста повторите ввод.");
                    continue;
                }
                $(idt + "-variant" + text).click();
                break;
            case 'select':
                text = text.replace(/\D/g, '');
                if (isRequiered && (text.length <= 0 || $(idt + ' option').length < Number(text) || Number(text) < 1))
                {
                    await GetVoiceByText("Элемент с таким номером в списке отсутствует. Пожалуйста повторите ввод.");
                    continue;
                }
                $(idt + ' option[value=' + id + '-variant'+ text + ']').prop('selected', 'selected').change();
                $(idt).blur();
                break;
        };

        break;
    }
}

/**
 * Осуществляет заполнение формы с заданными полями
 */
async function Algorithm()
{
    await GetVoiceByText("Привет. Я голосовой помощник Ксения и я помогу Вам заполнить форму о неисправности. Если вы захотите пропустить ввод значения в одно из полей скажите слово пропустить");

    await CompletingField("field1");
    await CompletingField("field2");
    await CompletingField("field3");
    await CompletingField("field4");
    await CompletingField("field5");
    await CompletingField("field6");
    await CompletingField("field7");

    await GetVoiceByText("Форма заполнена. Хотите её отправить? Скажите да или нет.");

    var text = await GetVoiceToSend(3000);
    if (text == "да")
    {
        $("#sendButton").submit();
    }
    else
    {
        await GetVoiceByText("Хорошо. Хотите ли вы очистить форму для повторного заполнения");
        text = await GetVoiceToSend(3000);
        if (text == "да")
        {
            window.location.reload(true);
        }
    }
}

/**
 * Осуществляет запись голоса timeToSpeak милисекунд и их отправку на сервер
 *
 * @param {timeToSpeak} Время записи голоса.
 */
async function GetVoiceToSend(timeToSpeak)
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

    await PlayAudioByFile("/static/audio/pi.mp3");
    recorder.start();

    await sleep(timeToSpeak);
    await PlayAudioByFile("/static/audio/pi.mp3");
    var txt = await recorder.stop();
    return txt;
}

/**
 * Отправляет байты аудиоданных data на сервер и получает их текстовую версию
 *
 * @param {byte[]} data Аудио данные для сохранения.
 */
async function sendData(data)
{
    let csrftoken = getCookie('csrftoken');
    let response=await fetch("/voice_request", {
        method: "post",
        body: data,
        headers: { "X-CSRFToken": csrftoken },
    })

    var text = await response.text();
    return text;
}

/**
 * Преобразует текст text в аудио и воспроизводит его
 *
 * @param {string} text Текст для воспроизведения.
 */
async function GetVoiceByText(text)
{
    var Text = text;
    let csrftoken = getCookie('csrftoken');
    let response=await fetch("/text_request", {
        method: "post",
        body: Text,
        headers: { "X-CSRFToken": csrftoken, 'content-type': 'text/plain; charset=UTF-8' },
    });

    var blob = await response.blob();
    await PlayAudioByBlob(blob);
}

/**
 * Воспроизводит переданную в blob последовательность байтов
 *
 * @param {blob} blob Байты аудио для воспроизведения
 */
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

/**
 * Воспроизводит аудиофайл, расположенный в filePath
 * Используется для воспроизведения заданных звуков
 *
 * @param {string} filePath Адрес файла для воспроизведения
 */
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
function getCookie(name)
{
    var cookieValue = null;
    if (document.cookie && document.cookie !== '')
    {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++)
        {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '='))
            {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}