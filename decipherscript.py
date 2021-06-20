import os
os.system("pip install azure-storage-blob")
os.system("pip install mhyt")
os.system("pip install moviepy")
os.system("pip install ffmpeg-python")
os.system("pip install pafy")
os.system("pip3 install pydub")
os.system("pip3 install SpeechRecognition")
os.system("pip install gTTS")
os.system("pip install os")

from azure.storage.blob import ContainerClient

connection_string = "DefaultEndpointsProtocol=https;EndpointSuffix=core.windows.net;AccountName=decipherstorage795;AccountKey=0+77lFFZx4uKfxIYL4sgznMajte9Sjo7fNd3Ggm3nRPJ/q9YkDAoTgTa8rNw7wKrwsTUwkTsPulKMjM1rpG+LQ=="
container_name = "videos"
container_client = ContainerClient.from_connection_string(connection_string, container_name)

input_link_file_name = "input_link.txt"
input_link_blob_client = container_client.get_blob_client(input_link_file_name)
with open(input_link_file_name, "wb") as my_blob:
       download_stream = input_link_blob_client.download_blob()
       my_blob.write(download_stream.readall())

from mhyt import yt_download
f = open("input_link.txt", "r")
url = f.read()
file = "rhym_mp4.mp4"
yt_download(url,file)

from moviepy.editor import *
video = VideoFileClip('rhym_mp4.mp4')
audio = video.audio
audio.write_audiofile('rhym_mp3.wav')

os.system("ffmpeg -i rhym_mp4.mp4 -vcodec copy -an rhym_no_audio.mp4 -y")

# importing libraries 
import speech_recognition as sr 
import os 
from pydub import AudioSegment
from pydub.silence import split_on_silence
# create a speech recognition object
r = sr.Recognizer()
# a function that splits the audio file into chunks
# and applies speech recognition
file1 = open("write.txt","w+")#write mode
def get_large_audio_transcription(path):
    """
    Splitting the large audio file into chunks
    and apply speech recognition on each of these chunks
    """
    # open the audio file using pydub
    sound = AudioSegment.from_wav(path)  
    # split audio sound where silence is 700 miliseconds or more and get chunks
    chunks = split_on_silence(sound,
        # experiment with this value for your target audio file
        min_silence_len = 500,
        # adjust this per requirement
        silence_thresh = sound.dBFS-14,
        # keep the silence for 1 second, adjustable as well
        keep_silence=500,
    )
    folder_name = "audio-chunks"
    # create a directory to store the audio chunks
    if not os.path.isdir(folder_name):
        os.mkdir(folder_name)
    whole_text = ""
    # process each chunk 
    for i, audio_chunk in enumerate(chunks, start=1):
        # export audio chunk and save it in
        # the `folder_name` directory.
        chunk_filename = os.path.join(folder_name, f"chunk{i}.wav")
        audio_chunk.export(chunk_filename, format="wav")
        # recognize the chunk
        with sr.AudioFile(chunk_filename) as source:
            audio_listened = r.record(source)
            # try converting it to text
            try:
                text = r.recognize_google(audio_listened)
            except sr.UnknownValueError as e:
                print("Error:", str(e))
            else:
                text = f"{text.capitalize()}. "
                #print(chunk_filename, ":", text)
                whole_text += text
    file1.write(whole_text)
    file1.close()
    # return the text for all chunks detected
    return whole_text
path = "rhym_mp3.wav"
print("\nFull text:", get_large_audio_transcription(path))

from azure.storage.blob import ContainerClient

connection_string = "DefaultEndpointsProtocol=https;EndpointSuffix=core.windows.net;AccountName=decipherstorage795;AccountKey=0+77lFFZx4uKfxIYL4sgznMajte9Sjo7fNd3Ggm3nRPJ/q9YkDAoTgTa8rNw7wKrwsTUwkTsPulKMjM1rpG+LQ=="
container_name = "videos"
container_client = ContainerClient.from_connection_string(connection_string, container_name)
input_link_file_name = "language.txt"
input_link_blob_client = container_client.get_blob_client(input_link_file_name)
with open(input_link_file_name, "wb") as my_blob:
       download_stream = input_link_blob_client.download_blob()
       my_blob.write(download_stream.readall())
f = open("language.txt", "r")
lang_url = f.read()

from gtts import gTTS
import os
file = open("write.txt", "r").read().replace("\n", " ")
language = lang_url
# Passing the text and language to the engine, 
# here we have marked slow=False. Which tells 
# the module that the converted audio should 
# have a high speed
myobj = gTTS(text=str(file), lang=language, slow=True)
# Saving the converted audio in a mp3 file named
# welcome 
myobj.save("translated.mp3")
# Playing the converted file
os.system("mpg321 welcome.mp3")

os.system("ffmpeg -i rhym_no_audio.mp4 -i translated.mp3 -c:v copy -c:a copy final.mp4 -y")

from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
ffmpeg_extract_subclip("final.mp4", 0, 110, targetname="final_final.mp4")

import pafy
video = pafy.new(url) 
file2 = open("write_title.txt","w+")#write mode
file2.write(video.title)
file2.close()

from azure.storage.blob import ContainerClient, ContentSettings
print("Uploading files to blob Storage...")
file_name = "final_final.mp4"
blob_client = container_client.get_blob_client(file_name)
with open(file_name, "rb") as data:
    blob_client.upload_blob(data, overwrite=True, content_settings=ContentSettings(content_type="video/mp4"))
    print(f'file uploaded to blob storage')
file_vid_title = "write_title.txt"
blob_client_title = container_client.get_blob_client(file_vid_title)
with open(file_vid_title, "rb") as data:
    blob_client_title.upload_blob(data, overwrite=True)
    print(f'file uploaded to blob storage')

import os
from shutil import rmtree
# try:
#     os.remove("rhym_mp4.mp4")
# except:
#     print("Not done rhym_mp4.mp4 ")
# try:
#     os.remove("rhym_mp3.wav")
# except:
#     print("Not done rhym_mp3.wav ")
# try:
#     os.remove("rhym_no_audio.mp4")
# except:
#     print("Not done rhym_no_audio.mp4 ")
# try:
#     os.remove("translated.mp3")
# except:
#     print("Not done translated.mp3 ")
# try:
#     os.remove("final.mp4")
# except:
#     print("Not done final.mp4 ")
# try:
#     os.remove("write.txt")
# except:
#     print("Not done write.txt ")
# try:
#     rmtree('audio-chunks')
# except:
#     print("Not done audio-chunks ")
os.remove("rhym_mp4.mp4")
os.remove("rhym_mp3.wav")
os.remove("rhym_no_audio.mp4")
os.remove("translated.mp3")
os.remove("final.mp4")
os.remove("write.txt")
rmtree('audio-chunks')
