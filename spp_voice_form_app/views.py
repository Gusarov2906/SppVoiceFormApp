from django.shortcuts import render
from django.http import HttpResponse
from .stt import STT
from .tts import TTS
from text_to_num import alpha2digit


def index(request):
    return render(request, 'index.html')

def voice_request(request):
    name = './file_sound.wav'
    text = 'none'
    #print(request.body)
    f = open(name, 'wb')
    f.write(request.body)
    f.close()
    stt_ = STT()
    text = stt_.audio_to_text(name)
    text = alpha2digit(text, 'ru')
    return HttpResponse(text, content_type="text/plain")

def text_request(request):
    name = './file_text.wav'
    text = request.body.decode("utf-8")
    print(text)
    tts_ = TTS()
    tts_.text_to_wav(text, name)
    f = open(name, 'rb')
    data = f.read()
    f.close()
    return HttpResponse(data, content_type='application/octet-stream')

