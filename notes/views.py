from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from notes.models import Note
from django.http import JsonResponse, HttpResponse
from django.template import loader
from django.shortcuts import render
import json
from django.shortcuts import get_object_or_404 
import os
from groq import Groq        
from django.conf import settings
import markdown


def accounts(request):
  template = loader.get_template('personalnote/notes/templates/index.html')
  return HttpResponse(template.render())

@login_required
def get_notes(request):
    user  = request.user

    pre_data = Note.objects.filter(user = user).order_by("-updated_at")   
    
    data = {"notes":pre_data}

    return render(request, 'dashboard.html', context=data)


@login_required
def save_note(request):
  if request.method=="POST":
    user=request.user
    note_data = json.loads(request.body)
    title = note_data.get("title")
    content = note_data.get("content")

    note = Note(user=user,
                title = title,
                content = content,
                  )
    note.save()
    return JsonResponse({"success":True, })
  return JsonResponse({"success": False, "error": "Invalid request"})

@login_required
def delete_note(request, pk):
    note = get_object_or_404(Note, id=pk, user=request.user)
    note.delete()
    return JsonResponse({"success": True})
    

@login_required
def update_note(request, pk):
    if request.method=="POST":
      note_data = json.loads(request.body)
      title = note_data.get("title")
      content = note_data.get("content")
      
      note = get_object_or_404(Note, id=pk, user=request.user)

      note.title = title
      note.content = content

      note.save()
      return JsonResponse({"success": True})


@login_required
def llm_call(request, pk):
    if request.method=="POST":
        pre_note = get_object_or_404(Note, id=pk, user=request.user)

        title = pre_note.title
        content = pre_note.content

        note =title+ " " +content 

        client = Groq(api_key=settings.GROQ_API_KEY)
        try:
            chat_completion = client.chat.completions.create(
            messages=[
            {
                "role": "user",
                "content": f"You are a helpful assistant that summarizes notes. Summarize the following note in detailed bullet points, capturing all key ideas and important details. Each bullet point should be a full sentence. Aim for 100-150 words. Do NOT include any introductory or closing remarks, just the bullet points.\n\nNote:\n{note}"
            }
            ],
            model="llama-3.3-70b-versatile"
            )
        except Exception as e:
            return JsonResponse({"success":False})

        summary = chat_completion.choices[0].message.content
        summary_html = markdown.markdown(summary)
        return JsonResponse({"success": True, "message": summary_html})
    return JsonResponse({"success":False})



        
 


    


      


      
      
    

  

