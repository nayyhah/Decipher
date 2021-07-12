import os
import pafy
import speech_recognition as sr
from gtts import gTTS
from shutil import rmtree
from mhyt import yt_download
from pydub import AudioSegment
from googletrans import Translator
from pydub.silence import split_on_silence
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from azure.storage.blob import ContainerClient, ContentSettings

translator = Translator()

def get_large_audio_transcription(r, path):
    """
    Splits large audio file into chunks
    Applies speech recognition on each chunk

    """
    file1 = open("write.txt","w+")

    # open the audio file using pydub
    sound = AudioSegment.from_wav(path)
    # split audio sound where silence is 500 miliseconds or more into chunks
    chunks = split_on_silence(sound,
        min_silence_len = 500,
        silence_thresh = sound.dBFS-14,
        # keep the silence for 0.5 second
        keep_silence=500,
    )

    # create a directory to store the audio chunks
    folder_name = "audio-chunks"
    if not os.path.isdir(folder_name):
        os.mkdir(folder_name)

    whole_text = ""
    # process each chunk
    for i, audio_chunk in enumerate(chunks, start=1):
        # export and save audio chunk in `folder_name` directory.
        chunk_filename = os.path.join(folder_name, "chunk{}.wav".format(i))
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
                text = "{}. ".format(text.capitalize())
                #print(chunk_filename, ":", text)
                whole_text += text

    file1.write(whole_text)
    file1.close()

    # return the text for all chunks detected
    return whole_text

def main():

    """ Connection with Blob storage """
    connection_string = "DefaultEndpointsProtocol=https;EndpointSuffix=core.windows.net;AccountName=decipherstorage795;AccountKey=0+77lFFZx4uKfxIYL4sgznMajte9Sjo7fNd3Ggm3nRPJ/q9YkDAoTgTa8rNw7wKrwsTUwkTsPulKMjM1rpG+LQ=="
    container_name = "videos"
    container_client = ContainerClient.from_connection_string(connection_string, container_name)


    """ Retrieving youtube link from blob storage """
    input_link_file_name = "input_link.txt"
    input_link_blob_client = container_client.get_blob_client(input_link_file_name)
    with open(input_link_file_name, "wb") as my_blob:
           download_stream = input_link_blob_client.download_blob()
           my_blob.write(download_stream.readall())


    """ Downloading Youtube video """
    f = open("input_link.txt", "r")
    url = f.read()
    file = "rhym_mp4.mp4"
    yt_download(url,file)


    """ Extracting audio from video """
    video = VideoFileClip('rhym_mp4.mp4')
    audio = video.audio
    audio.write_audiofile('rhym_mp3.wav')


    """ Translating audio """

    # create a speech recognition object
    r = sr.Recognizer()

    # convert speech into text
    path = "rhym_mp3.wav"
    print("\nFull text:", get_large_audio_transcription(r, path))

    # retrieve user's selected language from blob storage
    lang_file_name = "language.txt"
    lang_blob_client = container_client.get_blob_client(lang_file_name)
    with open(lang_file_name, "wb") as my_blob:
           download_stream = lang_blob_client.download_blob()
           my_blob.write(download_stream.readall())
    f = open("language.txt", "r")
    lang = f.read()

    file = open("write.txt", "r").read().replace("\n", " ")
    language = lang

    # translate the speech in the audio file
    translation = translator.translate(str(file), dest=language)

    # convert translated text into audio
    # (slow=True: converted video has slow/normal speed)
    myobj = gTTS(text=translation.text, lang=language, slow=True)

    # saves the converted audio in an mp3 file
    myobj.save("translated.mp3")

    # merge the translated audio with the video with no audio
    videoclip = VideoFileClip("rhym_mp4.mp4")
    audioclip = AudioFileClip("translated.mp3")
    new_clip = videoclip.set_audio(audioclip)

    try:
        new_clip.write_videofile("final_final.mp4")
    except:
        pass

    videoclip.close()
    new_clip.close()
    video.close()

    """ Extracts name of youtube video from link """
    video = pafy.new(url)
    file2 = open("write_title.txt","w+")
    file2.write(video.title)
    file2.close()

    """ Uploads the required files into blob storage """
    print("Uploading files to blob Storage...")

    # uploads video
    file_name = "final_final.mp4"
    blob_client = container_client.get_blob_client(file_name)
    with open(file_name, "rb") as data:
        blob_client.upload_blob(data, overwrite=True, content_settings=ContentSettings(content_type="video/mp4"))
        print('file uploaded to blob storage')

    # uploads video's title
    file_vid_title = "write_title.txt"
    blob_client_title = container_client.get_blob_client(file_vid_title)
    with open(file_vid_title, "rb") as data:
        blob_client_title.upload_blob(data, overwrite=True)
        print('file uploaded to blob storage')


    """ Deletes files created during the process """
    os.remove("rhym_mp3.wav")
    os.remove("translated.mp3")
    os.remove("write.txt")
    rmtree('audio-chunks')
    os.remove("rhym_mp4.mp4")

main()
