from django.shortcuts import render
from django.http import HttpResponse
from .stt import STT


def index(request):
    return render(request, 'index.html')

def voice_request(request):
    name = './file.wav'
    text = 'none'
    #print(request.body)
    f = open(name, 'wb')
    f.write(request.body)
    f.close()
    stt_ = STT()
    text = stt_.audio_to_text(name)
    print(text)
    #return HttpResponse('audio received')
    return HttpResponse(text, content_type="text/plain")
# Create your views here.
